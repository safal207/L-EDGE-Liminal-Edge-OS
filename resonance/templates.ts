import { CollectiveTemplate } from './collectiveContracts';

export const defaultCollectiveTemplates: CollectiveTemplate[] = [
  {
    id: 'mirror-builder',
    kind: 'mirror',
    tags: ['pattern-seeker', 'calm'],
    traits: { patternSeeking: 0.7, calmRecovery: 0.65 },
    dominantEmotions: ['calm', 'ready'],
  },
  {
    id: 'mirror-guardian',
    kind: 'mirror',
    tags: ['avoidant', 'reactive'],
    traits: { avoidantUnderLoad: 0.7, reflexReliance: 0.65 },
    dominantEmotions: ['alert'],
  },
  {
    id: 'echo-resilient',
    kind: 'echo',
    tags: ['calm', 'social'],
    traits: { calmRecovery: 0.75, socialOrientation: 0.65 },
    dominantEmotions: ['recover', 'calm'],
  },
  {
    id: 'echo-cautionary',
    kind: 'echo',
    tags: ['avoidant', 'risk-averse'],
    traits: { avoidantUnderLoad: 0.8, riskTaking: 0.2 },
    dominantEmotions: ['tension'],
  },
  {
    id: 'seed-explorer',
    kind: 'seed',
    tags: ['explorer', 'pattern-seeker'],
    traits: { exploration: 0.75, patternSeeking: 0.7 },
    dominantEmotions: ['curiosity', 'expand'],
  },
  {
    id: 'seed-synchronizer',
    kind: 'seed',
    tags: ['social', 'calm'],
    traits: { socialOrientation: 0.7, calmRecovery: 0.6 },
    dominantEmotions: ['open'],
  },
];
