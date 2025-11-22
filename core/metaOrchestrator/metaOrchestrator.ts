import { clamp } from '../../meta/patternDetector';
import { CollectiveResonanceSnapshot } from '../../resonance/collectiveContracts';
import { FieldSnapshot } from '../../field/contracts';
import { IntentState } from '../../intent/types';
import { NoosphereSnapshot } from '../../noosphere/contracts';
import { HeartbeatState } from '../types';
import {
  MetaOrchestratorContext,
  MetaOrchestratorDeps,
  MetaSystemSnapshot,
  defaultUnknownSnapshot,
  FieldMode,
} from './types';

const resolveFieldMode = (support?: number, tension?: number): FieldMode => {
  if (support === undefined && tension === undefined) return 'unknown';
  const safeSupport = support ?? 0;
  const safeTension = tension ?? 0;
  if (safeSupport > 0.6 && safeTension < 0.4) return 'supportive';
  if (safeTension > 0.65) return 'high_tension';
  return 'neutral';
};

const computeStability = (heartbeat?: HeartbeatState | null, collective?: CollectiveResonanceSnapshot | null, field?: FieldSnapshot | null) => {
  const stressPenalty = (heartbeat?.homeostasis?.stressScore ?? 0) * 0.4;
  const resonancePenalty = (collective?.volatility ?? 0) * 0.3;
  const entropyPenalty = (field?.pastField.entropy ?? heartbeat?.field?.pastEntropy ?? 0) * 0.3;
  return clamp(1 - stressPenalty - resonancePenalty - entropyPenalty);
};

const computeCoherence = (
  stress: number,
  tension: number,
  support: number,
  stability: number,
  collectiveMode?: string,
): number => {
  const stabilityBonus = stability * 0.25;
  const supportBonus = support * 0.3;
  const calmBonus = clamp(1 - stress) * 0.25;
  const tensionPenalty = tension * 0.25;
  const resonanceBonus = collectiveMode === 'resonant' ? 0.1 : 0;
  return clamp(stabilityBonus + supportBonus + calmBonus - tensionPenalty + resonanceBonus);
};

const buildComment = (coherence: number, tension: number, mode: FieldMode) => {
  if (tension > 0.75) return 'Высокое напряжение: требуется щадящий режим.';
  if (coherence > 0.7 && mode === 'supportive') {
    return 'Система в устойчивом состоянии, поле поддерживает глубокие задачи.';
  }
  if (coherence < 0.4) return 'Согласованность низкая, стоит снизить нагрузку и пересмотреть ритм.';
  return 'Система сбалансирована, продолжаем наблюдение.';
};

export class MetaOrchestrator {
  private readonly deps: MetaOrchestratorDeps;
  private lastSnapshot: MetaSystemSnapshot | null = null;

  constructor(deps: MetaOrchestratorDeps) {
    this.deps = deps;
  }

  update(context?: MetaOrchestratorContext): MetaSystemSnapshot {
    const heartbeat = context?.heartbeat ?? this.deps.getLastHeartbeat?.() ?? null;
    const field = context?.field ?? this.deps.getLastFieldSnapshot?.() ?? null;
    const collective = context?.collective ?? this.deps.getLastCollectiveResonance?.() ?? null;
    const intent = context?.intent ?? this.deps.getLastIntent?.() ?? null;
    const noosphere = context?.noosphere ?? this.deps.getLastNoosphere?.() ?? null;

    if (!heartbeat) {
      this.lastSnapshot = { ...defaultUnknownSnapshot, timestamp: Date.now() };
      return this.lastSnapshot;
    }

    const stressLevel = heartbeat.homeostasis?.stressScore ?? 0;
    const supportLevel = noosphere?.supportLevel ?? 0;
    const tensionLevel = Math.max(noosphere?.tensionLevel ?? 0, stressLevel, collective?.volatility ?? 0);
    const stability = computeStability(heartbeat, collective, field);
    const fieldMode = resolveFieldMode(noosphere?.supportLevel, noosphere?.tensionLevel);
    const coherence = computeCoherence(stressLevel, tensionLevel, supportLevel, stability, collective?.primaryMode);
    const comment = buildComment(coherence, tensionLevel, fieldMode);

    const snapshot: MetaSystemSnapshot = {
      timestamp: Date.now(),
      organism: {
        stressLevel,
        stability,
        lastHeartbeatId: heartbeat.timestamp,
      },
      field: {
        pastEntropy: field?.pastField.entropy ?? heartbeat.field?.pastEntropy,
        futureConfidence: field?.futureField.confidence ?? heartbeat.field?.futureConfidence,
        mode: fieldMode,
      },
      intent: {
        lastIntentId: intent?.lastEvaluatedAt?.toString(),
        kind: intent?.mode,
        fieldAlignment: intent?.decision.fieldAlignment ?? 'unknown',
      },
      resonance: {
        primaryMode: collective?.primaryMode ?? 'unknown',
        topMirrorId: collective?.topMirrors[0]?.templateId,
        topSeedId: collective?.topSeeds[0]?.templateId,
      },
      meta: {
        coherence,
        tension: clamp(tensionLevel),
        comment,
      },
    };

    this.lastSnapshot = snapshot;
    return snapshot;
  }

  getLastSnapshot(): MetaSystemSnapshot | null {
    return this.lastSnapshot;
  }
}
