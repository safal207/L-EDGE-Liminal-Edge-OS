// L4 Social Teaming: early team sense and role experimentation

export interface L4SocialTeamSnapshot {
  socialAge: number;
  socialTeamSense: number;
  cooperation: number;
  roleExperimentation: number;
  conflictNavigation: number;
  note: string;
}

export function computeL4SocialTeam(params: {
  l3Cooperation: number;
  l3ConflictSkill: number;
  microMasteryScore: number;
  frustrationTolerance: number;
}): L4SocialTeamSnapshot {
  const { l3Cooperation, l3ConflictSkill, microMasteryScore, frustrationTolerance } = params;

  const socialTeamSense = clamp01(0.4 * l3Cooperation + 0.3 * microMasteryScore + 0.1);
  const cooperation = clamp01(0.5 * l3Cooperation + 0.2 * microMasteryScore + 0.1);
  const roleExperimentation = clamp01(0.3 + 0.3 * microMasteryScore + 0.2 * frustrationTolerance);
  const conflictNavigation = clamp01(0.4 * l3ConflictSkill + 0.3 * frustrationTolerance + 0.1);

  const socialAge = 8;

  return {
    socialAge,
    socialTeamSense,
    cooperation,
    roleExperimentation,
    conflictNavigation,
    note: 'L4: ученик в команде — сотрудничество, роли и навигация конфликтов.',
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
