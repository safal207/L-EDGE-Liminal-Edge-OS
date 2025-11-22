import { EmotionSnapshot } from '../emotion/contracts';
import { PerceptionSummary } from '../perception/types';
import { SelfModelSummary } from '../self/contracts';
import { CollectiveResonanceMatch, CollectiveResonanceSnapshot, CollectiveTemplate, CollectiveTemplateKind } from '../core/types';

export { CollectiveResonanceMatch, CollectiveResonanceSnapshot, CollectiveTemplate, CollectiveTemplateKind };

export interface CollectiveResonanceState {
  snapshot: CollectiveResonanceSnapshot;
  history: CollectiveResonanceMatch[];
}

export interface CollectiveResonanceContext {
  self: SelfModelSummary;
  emotion?: EmotionSnapshot;
  perception?: PerceptionSummary;
}

export interface CollectiveResonanceOptions {
  historyLimit?: number;
  volatilityWindow?: number;
  matchThreshold?: number;
}
