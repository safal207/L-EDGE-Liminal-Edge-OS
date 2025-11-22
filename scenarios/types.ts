import { CollectiveResonanceSnapshot } from '../resonance/collectiveContracts';
import { NoosphereReport } from '../noosphere/contracts';
import { HeartbeatState } from '../core/types';

export interface ScenarioRule {
  id: string;
  when: {
    noosphereMode?: 'supportive' | 'neutral' | 'high_tension';
    minSupport?: number;
    maxTension?: number;
    lastIntentAlignment?: 'aligned' | 'neutral' | 'against_field';
  };
  then: {
    recommendedMode: 'deep_focus' | 'light_tasks' | 'recovery' | 'social' | 'explore' | 'maintenance';
    priority: number;
    message: string;
  };
}

export interface ScenarioContext {
  noosphereReport: NoosphereReport;
  heartbeat?: HeartbeatState;
  collectiveResonance?: CollectiveResonanceSnapshot;
}

export interface ScenarioResult {
  ruleId: string;
  recommendedMode: ScenarioRule['then']['recommendedMode'];
  message: string;
  score: number;
}
