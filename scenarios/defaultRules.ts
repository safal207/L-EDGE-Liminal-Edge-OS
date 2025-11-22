import { ScenarioRule } from './types';

export const defaultScenarioRules: ScenarioRule[] = [
  {
    id: 'supportive-aligned-focus',
    when: { noosphereMode: 'supportive', minSupport: 0.55, maxTension: 0.5, lastIntentAlignment: 'aligned' },
    then: {
      recommendedMode: 'deep_focus',
      priority: 1.2,
      message: 'Field is supportive and intent is aligned — commit to deep focus work.',
    },
  },
  {
    id: 'high-tension-recovery',
    when: { noosphereMode: 'high_tension', maxTension: 1 },
    then: {
      recommendedMode: 'recovery',
      priority: 1,
      message: 'Field tension is high — shift to recovery and reduce risk.',
    },
  },
  {
    id: 'neutral-social',
    when: { noosphereMode: 'neutral', minSupport: 0.3 },
    then: {
      recommendedMode: 'social',
      priority: 0.7,
      message: 'Neutral field with moderate support — lean into social or collaborative tasks.',
    },
  },
  {
    id: 'explore-opportunity',
    when: { noosphereMode: 'supportive', minSupport: 0.65 },
    then: {
      recommendedMode: 'explore',
      priority: 0.6,
      message: 'Opportunities are present — explore adjacent ideas or experiments.',
    },
  },
];
