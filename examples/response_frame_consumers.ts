import type { ResponseFrame } from '@/nerve/L13_response_types';

// Minimal mocks for downstream systems
class Scheduler {
  setMode(mode: 'normal' | 'recovery') {
    console.log(`scheduler → mode set to ${mode}`);
  }
  pauseNonEssentialJobs() {
    console.log('scheduler → pausing non-essential jobs');
  }
  reduceParallelism(fraction: number) {
    console.log(`scheduler → reducing parallelism to ${(fraction * 100).toFixed(0)}%`);
  }
}

class NetworkClient {
  pauseChannel(name: string) {
    console.log(`network → pausing channel '${name}'`);
  }
  setMaxThroughputFraction(fraction: number) {
    console.log(`network → throttling to ${(fraction * 100).toFixed(0)}% throughput`);
  }
}

class LlmRuntime {
  enableExploration(opts: { maxParallel: number }) {
    console.log(`llm_runtime → exploration enabled (maxParallel=${opts.maxParallel})`);
  }
  disableExploration() {
    console.log('llm_runtime → exploration disabled');
  }
}

class LiminalUI {
  enableFocusMode() {
    console.log('ui → focus mode ON (fewer notifications)');
  }
  disableFocusMode() {
    console.log('ui → focus mode OFF');
  }
  showGentleBanner(text: string) {
    console.log(`ui → banner: ${text}`);
  }
  highlightInsightsPanel() {
    console.log('ui → highlighting insights panel');
  }
  setDefaultLayout() {
    console.log('ui → default layout');
  }
}

// --- Consumers -------------------------------------------------------------

function tickScheduler(frame: ResponseFrame, scheduler: Scheduler) {
  for (const intent of frame.intents) {
    if (intent.scope !== 'scheduling') continue;

    if (intent.kind === 'enter_recovery_mode' && intent.confidence > 0.7) {
      scheduler.setMode('recovery');
      scheduler.pauseNonEssentialJobs();
    }

    if (intent.kind === 'stabilize' && intent.strength !== 'hint') {
      scheduler.reduceParallelism(0.5);
    }
  }
}

function applyNetworkIntents(frame: ResponseFrame, net: NetworkClient) {
  for (const intent of frame.intents) {
    if (intent.scope !== 'network') continue;

    if (intent.kind === 'pause_non_critical' && intent.urgency !== 'low') {
      net.pauseChannel('telemetry');
      net.pauseChannel('debug_logs');
    }

    if (intent.kind === 'throttle') {
      const factor = Number(intent.params?.['max_load_factor'] ?? 0.7);
      net.setMaxThroughputFraction(factor);
    }
  }
}

function updateExplorationMode(frame: ResponseFrame, runtime: LlmRuntime) {
  let open = false;
  let close = false;

  for (const intent of frame.intents) {
    if (intent.scope !== 'llm_runtime') continue;
    if (intent.kind === 'open_exploration_window' && intent.confidence > 0.6) open = true;
    if (intent.kind === 'close_exploration_window') close = true;
  }

  if (open) {
    const maxExp = frame.intents.find((i) => i.kind === 'open_exploration_window')?.params?.['max_parallel_experiments'] ?? 1;
    runtime.enableExploration({ maxParallel: Number(maxExp) });
  } else if (close) {
    runtime.disableExploration();
  }
}

function adaptUi(frame: ResponseFrame, ui: LiminalUI) {
  const overloadIntent = frame.intents.find((i) => i.reasonKey === 'overload_risk');
  if (overloadIntent) {
    ui.enableFocusMode();
    ui.showGentleBanner('System under load — soft mode on');
    return;
  }

  const growthIntent = frame.intents.find((i) => i.reasonKey === 'good_growth_window');
  if (growthIntent) {
    ui.disableFocusMode();
    ui.highlightInsightsPanel();
    return;
  }

  ui.setDefaultLayout();
}

// --- Demo frames -----------------------------------------------------------

const overloadFrame: ResponseFrame = {
  timestamp: Date.now(),
  stage: 11,
  growthMode: 'therapeutic',
  overloadRisk: 0.92,
  harmonyIndex: 0.4,
  intents: [
    {
      id: 'intent-overload-throttle',
      scope: 'system',
      kind: 'throttle',
      urgency: 'critical',
      strength: 'hard_limit',
      confidence: 0.9,
      reasonKey: 'overload_risk',
      params: { max_load_factor: 0.6 },
      ttlMs: 5000,
    },
    {
      id: 'intent-overload-pause',
      scope: 'network',
      kind: 'pause_non_critical',
      urgency: 'high',
      strength: 'strong_recommendation',
      confidence: 0.75,
      reasonKey: 'overload_risk',
      ttlMs: 5000,
    },
    {
      id: 'intent-overload-recovery',
      scope: 'scheduling',
      kind: 'enter_recovery_mode',
      urgency: 'high',
      strength: 'strong_recommendation',
      confidence: 0.78,
      reasonKey: 'deep_recovery_needed',
      ttlMs: 15000,
    },
  ],
};

const exploratoryFrame: ResponseFrame = {
  timestamp: Date.now(),
  stage: 11,
  growthMode: 'exploratory',
  overloadRisk: 0.18,
  harmonyIndex: 0.72,
  intents: [
    {
      id: 'intent-explore-window',
      scope: 'llm_runtime',
      kind: 'open_exploration_window',
      urgency: 'normal',
      strength: 'soft_recommendation',
      confidence: 0.78,
      reasonKey: 'good_growth_window',
      params: { max_parallel_experiments: 3 },
      ttlMs: 20000,
    },
  ],
};

const stabilizingFrame: ResponseFrame = {
  timestamp: Date.now(),
  stage: 11,
  growthMode: 'stabilizing',
  overloadRisk: 0.35,
  harmonyIndex: 0.48,
  intents: [
    {
      id: 'intent-stabilize',
      scope: 'scheduling',
      kind: 'stabilize',
      urgency: 'normal',
      strength: 'soft_recommendation',
      confidence: 0.65,
      reasonKey: 'need_stability',
      ttlMs: 10000,
    },
  ],
};

const neutralFrame: ResponseFrame = {
  timestamp: Date.now(),
  stage: 11,
  growthMode: 'gentle',
  overloadRisk: 0.22,
  harmonyIndex: 0.55,
  intents: [
    {
      id: 'intent-log',
      scope: 'system',
      kind: 'log_and_observe',
      urgency: 'low',
      strength: 'hint',
      confidence: 0.5,
      reasonKey: 'baseline_health_check',
      ttlMs: 3000,
    },
  ],
};

// --- Demo runner -----------------------------------------------------------

const frames: ResponseFrame[] = [overloadFrame, exploratoryFrame, stabilizingFrame, neutralFrame];

const scheduler = new Scheduler();
const network = new NetworkClient();
const runtime = new LlmRuntime();
const ui = new LiminalUI();

function handleFrame(frame: ResponseFrame) {
  console.log('\n==============================');
  console.log(`response frame: ${frame.growthMode ?? 'unknown'} | intents=${frame.intents.length}`);

  tickScheduler(frame, scheduler);
  applyNetworkIntents(frame, network);
  updateExplorationMode(frame, runtime);
  adaptUi(frame, ui);
}

function main() {
  frames.forEach(handleFrame);
}

main();
