import { MemorySnapshot } from '../memory/memoryTypes';

export type ReplayStatus = 'idle' | 'running' | 'error';

export interface ReplayEpisode {
  id: string;
  snapshotId: string;
  ts: number;
  summary: string;
  stressScore: number;
  noveltyScore: number;
  dominantSources: string[];
  volume: number;
  tags?: string[];
}

export interface ReplayResult {
  episodeId: string;
  snapshotId: string;
  reducedStress: number;
  integrationScore: number;
  patternTags: string[];
}

export interface ReplayState {
  status: ReplayStatus;
  lastRunAt: number;
  episodesProcessed: number;
  avgIntegrationScore: number;
  reliefScore: number;
  lastError?: string;
  lastTrigger?: string;
  lastResults: ReplayResult[];
  lastEpisodes: ReplayEpisode[];
}

export interface ReplayConfig {
  maxEpisodes?: number;
  minStressThreshold?: number;
  noveltyBias?: number;
}

export interface ReplaySelectionContext {
  snapshots: MemorySnapshot[];
  limit: number;
  minStressThreshold: number;
  noveltyBias: number;
}
