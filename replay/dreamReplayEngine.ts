import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { MemoryEngine } from '../memory/memoryEngine';
import { MemorySnapshot } from '../memory/memoryTypes';
import { TransmutationEngine } from '../transmutation/transmutationEngine';
import type { SleepPlan } from '../sleep/sleepCycle';
import { ReplayConfig, ReplayEpisode, ReplayResult, ReplaySelectionContext, ReplayState } from './types';

interface DreamReplayDeps {
  memory: MemoryEngine;
  transmutation?: TransmutationEngine;
  config?: ReplayConfig;
}

export interface DreamReplayContext {
  sleepPlan: SleepPlan;
}

export interface ReplayEvents {
  replay: (state: ReplayState) => void;
}

export class DreamReplayEngine extends EventEmitter {
  private readonly maxEpisodes: number;
  private readonly minStressThreshold: number;
  private readonly noveltyBias: number;
  private currentPlan?: SleepPlan;
  private state: ReplayState = {
    status: 'idle',
    lastRunAt: 0,
    episodesProcessed: 0,
    avgIntegrationScore: 0,
    reliefScore: 0,
    lastResults: [],
    lastEpisodes: [],
  };

  constructor(private readonly deps: DreamReplayDeps) {
    super();
    this.maxEpisodes = deps.config?.maxEpisodes ?? 5;
    this.minStressThreshold = deps.config?.minStressThreshold ?? 0.2;
    this.noveltyBias = deps.config?.noveltyBias ?? 0.25;
  }

  override on<U extends keyof ReplayEvents>(event: U, listener: ReplayEvents[U]): this {
    return super.on(event, listener);
  }

  override emit<U extends keyof ReplayEvents>(event: U, ...args: Parameters<ReplayEvents[U]>): boolean {
    return super.emit(event, ...args);
  }

  runReplayCycle(trigger: 'sleep' | 'manual' | 'external' = 'manual', ctx?: DreamReplayContext): ReplayState {
    this.currentPlan = ctx?.sleepPlan ?? this.currentPlan;
    const snapshots = this.deps.memory.getState().longTerm;
    const episodes = this.selectEpisodes({
      snapshots,
      limit: this.resolveEpisodeLimit(),
      minStressThreshold: this.minStressThreshold,
      noveltyBias: this.noveltyBias,
      sleepPlan: this.currentPlan,
    });

    if (episodes.length === 0) {
      this.state = {
        ...this.state,
        status: 'idle',
        lastRunAt: Date.now(),
        episodesProcessed: 0,
        avgIntegrationScore: 0,
        reliefScore: 0,
        lastTrigger: trigger,
        lastEpisodes: [],
        lastResults: [],
      };
      this.emit('replay', this.state);
      return this.state;
    }

    this.state = { ...this.state, status: 'running', lastTrigger: trigger };
    try {
      const results = episodes.map((episode) => this.processEpisode(episode));
      const avgIntegrationScore = results.reduce((sum, r) => sum + r.integrationScore, 0) / results.length;
      const reliefScore = clamp(results.reduce((sum, r) => sum + r.reducedStress, 0) / results.length);

      this.deps.memory.ingestReplayResults(results, `replay.${trigger}`);

      this.state = {
        status: 'idle',
        lastRunAt: Date.now(),
        episodesProcessed: episodes.length,
        avgIntegrationScore,
        reliefScore,
        lastTrigger: trigger,
        lastResults: results,
        lastEpisodes: episodes,
      } satisfies ReplayState;
      this.emit('replay', this.state);
      return this.state;
    } catch (err) {
      this.state = {
        ...this.state,
        status: 'error',
        lastError: err instanceof Error ? err.message : 'unknown error',
        lastRunAt: Date.now(),
      };
      this.emit('replay', this.state);
      return this.state;
    }
  }

  scheduleReplay(trigger: 'sleep' | 'manual' | 'external' = 'manual', ctx?: DreamReplayContext): ReplayState {
    return this.runReplayCycle(trigger, ctx);
  }

  getState(): ReplayState {
    return this.state;
  }

  getEpisodes(): ReplayEpisode[] {
    return [...this.state.lastEpisodes];
  }

  getResults(): ReplayResult[] {
    return [...this.state.lastResults];
  }

  getSummary() {
    return {
      lastRunAt: this.state.lastRunAt,
      episodes: this.state.episodesProcessed,
      avgIntegrationScore: this.state.avgIntegrationScore,
      reliefScore: this.state.reliefScore,
      status: this.state.status,
    };
  }

  private selectEpisodes(context: ReplaySelectionContext & { sleepPlan?: SleepPlan }): ReplayEpisode[] {
    const rankedSnapshots = [...context.snapshots].filter((snap) => (snap.stressScore ?? 0) >= context.minStressThreshold);
    const plan = context.sleepPlan;

    let episodes = rankedSnapshots.map((snapshot) => this.toEpisode(snapshot));

    if (plan?.mode === 'deep') {
      // Recovery-focused deep sleep prioritises calmer content.
      episodes = episodes.filter((episode) => episode.stressScore < 0.85);
      episodes.sort((a, b) => a.stressScore - b.stressScore || b.noveltyScore - a.noveltyScore);
    } else if (plan?.mode === 'integrative') {
      // Integrative windows encourage recombination and novelty mixing.
      episodes.sort((a, b) => b.noveltyScore - a.noveltyScore || a.stressScore - b.stressScore);
    } else {
      episodes.sort((a, b) => (b.stressScore ?? 0) - (a.stressScore ?? 0) || (b.noveltyScore ?? 0) - (a.noveltyScore ?? 0));
    }

    const picked = episodes.slice(0, context.limit);
    if (picked.length > 0) {
      return picked;
    }

    return context.snapshots
      .slice(0, Math.min(context.limit, context.snapshots.length))
      .map((snapshot) => this.toEpisode(snapshot));
  }

  private toEpisode(snapshot: MemorySnapshot): ReplayEpisode {
    const noveltyBase = clamp((Date.now() - (snapshot.lastEventAt ?? snapshot.ts)) / (60 * 60 * 1000) * 0.05);
    const noveltyScore = clamp(noveltyBase * (1 + this.noveltyBias));
    return {
      id: uuidv4(),
      snapshotId: snapshot.id,
      ts: snapshot.ts,
      summary: snapshot.summary,
      stressScore: clamp(snapshot.stressScore ?? 0.3),
      noveltyScore,
      dominantSources: snapshot.dominantSources,
      volume: snapshot.volume,
      tags: Object.keys(snapshot.eventTypes),
    };
  }

  private processEpisode(episode: ReplayEpisode): ReplayResult {
    const signalStrength = this.deps.transmutation?.getMetrics().signalStrength ?? 0.5;
    const recoveryFocus = this.currentPlan?.mode === 'deep' ? 0.85 : 0.5;
    const replayFocus = this.currentPlan?.mode === 'integrative' && this.currentPlan.cognitiveOpen ? 0.75 : 0.4;

    const integrationScore = clamp(
      episode.noveltyScore * (0.25 + replayFocus * 0.15) +
        (1 - episode.stressScore) * (0.25 + recoveryFocus * 0.15) +
        signalStrength * 0.4 +
        this.noveltyBias * 0.1
    );

    const reliefMultiplier = 0.6 + recoveryFocus * 0.25 + (this.currentPlan?.mode === 'deep' ? 0.05 : 0);
    const reducedStress = clamp(Math.max(0, episode.stressScore - integrationScore * reliefMultiplier));

    return {
      episodeId: episode.id,
      snapshotId: episode.snapshotId,
      reducedStress,
      integrationScore,
      patternTags: [...new Set([...(episode.tags ?? []), ...episode.dominantSources])].slice(0, 5),
    } satisfies ReplayResult;
  }

  private resolveEpisodeLimit(): number {
    if (!this.currentPlan) {
      return this.maxEpisodes;
    }

    if (this.currentPlan.mode === 'deep' && !this.currentPlan.cognitiveOpen) {
      return Math.max(1, Math.round(this.maxEpisodes * 0.6));
    }

    if (this.currentPlan.mode === 'integrative' && this.currentPlan.cognitiveOpen) {
      return Math.max(1, this.maxEpisodes + 1);
    }

    return this.maxEpisodes;
  }
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
