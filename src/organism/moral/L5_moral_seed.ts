// L5 Moral Seed — captures early ethical tilt: care, integrity, courage.

export interface L5MoralSeed {
  moralCare: number; // 0..1 — забота о других / среде
  moralIntegrity: number; // 0..1 — согласованность действий и внутренних ценностей
  moralCourage: number; // 0..1 — готовность действовать по ценностям под нагрузкой
  note: string;
}

export function computeL5MoralSeed(params: {
  socialTeamSense: number; // из L4SocialTeamSnapshot
  cooperation: number; // из L4SocialTeamSnapshot
  conflictNavigation: number; // из L4SocialTeamSnapshot
  meaningCoherence: number; // из L5MeaningSnapshot
}): L5MoralSeed {
  const { socialTeamSense, cooperation, conflictNavigation, meaningCoherence } = params;

  const moralCare = clamp01(0.4 * socialTeamSense + 0.3 * cooperation + 0.1);
  const moralIntegrity = clamp01(0.4 * meaningCoherence + 0.3 * socialTeamSense + 0.1);
  const moralCourage = clamp01(0.3 * conflictNavigation + 0.3 * meaningCoherence + 0.2 * socialTeamSense);

  return {
    moralCare,
    moralIntegrity,
    moralCourage,
    note: 'L5: зародыш собственной этики — забота, целостность и смелость.',
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
