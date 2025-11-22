import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { MemoryEngine } from '../memory/memoryEngine';
import { MemorySnapshot } from '../memory/memoryTypes';
import { TransmutationEngine } from '../transmutation/transmutationEngine';
import { ReplayConfig, ReplayEpisode, ReplayResult, ReplaySelectionContext, ReplayState } from './types';

interface DreamReplayDeps {
  memory: MemoryEngine;
  transmutation?: TransmutationEngine;
  config?: ReplayConfig;
}

export interface ReplayEvents {
  replay: (state: ReplayState) => void;
}

export class DreamReplayEngine extends EventEmitter {
  private readonly maxEpisodes: number;
  private readonly minStressThreshold: number;
  private readonly noveltyBias: number;
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

  runReplayCycle(trigger: 'sleep' | 'manual' | 'external' = 'manual'): ReplayState {
    const snapshots = this.deps.memory.getState().longTerm;
    const episodes = this.selectEpisodes({
      snapshots,
      limit: this.maxEpisodes,
      minStressThreshold: this.minStressThreshold,
      noveltyBias: this.noveltyBias,
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

  scheduleReplay(trigger: 'sleep' | 'manual' | 'external' = 'manual'): ReplayState {
    return this.runReplayCycle(trigger);
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

  private selectEpisodes(context: ReplaySelectionContext): ReplayEpisode[] {
    const ranked = [...context.snapshots]
      .filter((snap) => (snap.stressScore ?? 0) >= context.minStressThreshold)
      .sort((a, b) => (b.stressScore ?? 0) - (a.stressScore ?? 0) || (b.lastEventAt ?? 0) - (a.lastEventAt ?? 0));

    const picked = ranked.slice(0, context.limit).map((snapshot) => this.toEpisode(snapshot));
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
    const integrationScore = clamp(
      episode.noveltyScore * 0.2 + (1 - episode.stressScore) * 0.3 + signalStrength * 0.5 + this.noveltyBias * 0.1
    );
    const reducedStress = clamp(Math.max(0, episode.stressScore - integrationScore * 0.6));

    return {
      episodeId: episode.id,
      snapshotId: episode.snapshotId,
      reducedStress,
      integrationScore,
      patternTags: [...new Set([...(episode.tags ?? []), ...episode.dominantSources])].slice(0, 5),
    } satisfies ReplayResult;
  }
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
