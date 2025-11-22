import type { OriginState } from '../origin/types';
import type { MetaSystemSnapshot } from '../metaOrchestrator/types';

export type PathwayPace = 'slow' | 'steady' | 'fast';

export interface PathwayState {
  timestamp: number;
  growthVector: {
    trajectory: string;
    pace: PathwayPace;
    alignmentScore: number; // 0..1
  };
  branches: {
    active: string[];
    emerging: string[];
    fading: string[];
  };
  futurePull: {
    ideas: string[];
    intensity: number; // 0..1
  };
  summary: string;
}

export interface PathwayConfig {
  defaultTrajectory?: string;
  defaultIdeas?: string[];
  branchLimit?: number;
}

export interface PathwayUpdateInput {
  originState: OriginState;
  metaSnapshot: MetaSystemSnapshot;
}
