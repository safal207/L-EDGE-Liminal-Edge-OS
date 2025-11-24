// L4 Skill Cluster: emerging capabilities shaped by patterning, mastery, and cosmic seeds

import type { CosmicPreseed } from '../cosmic/cosmic_preseed';

export type SkillTag =
  | 'pattern-tracking'
  | 'structured-actions'
  | 'social-coordination'
  | 'emotional-attunement'
  | 'exploratory-prototyping'
  | 'bio-sensitivity'
  | 'motion-design';

export interface L4SkillCluster {
  skills: SkillTag[];
  primarySkill: SkillTag | null;
  richness: number; // 0..1 — diversity and depth
  note: string;
}

export function computeL4SkillCluster(params: {
  innerPatternScore: number;
  microMasteryScore: number;
  socialPatternSense: number;
  cosmicPreseed: CosmicPreseed;
}): L4SkillCluster {
  const { innerPatternScore, microMasteryScore, socialPatternSense, cosmicPreseed } = params;

  const skills = new Set<SkillTag>();

  if (innerPatternScore > 0.3) skills.add('pattern-tracking');
  if (microMasteryScore > 0.35) skills.add('structured-actions');
  if (socialPatternSense > 0.3) skills.add('social-coordination');

  switch (cosmicPreseed) {
    case 'structure':
      skills.add('structured-actions');
      break;
    case 'resonance':
      skills.add('emotional-attunement');
      break;
    case 'life':
      skills.add('bio-sensitivity');
      break;
    case 'movement':
      skills.add('motion-design');
      break;
    case 'exploration':
      skills.add('exploratory-prototyping');
      break;
  }

  const skillsArray = Array.from(skills);
  const richness = clamp01(skillsArray.length / 6 + 0.2 * microMasteryScore);
  const primarySkill = skillsArray.length > 0 ? skillsArray[0] : null;

  const note =
    'L4: навыковый кластер ученика — ' +
    (skillsArray.length ? skillsArray.join(', ') : 'ещё в формировании');

  return {
    skills: skillsArray,
    primarySkill,
    richness,
    note,
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
