export interface L2SocialSnapshot {
  socialAge: number; // 1..3 (усреднённое)
  boundarySense: number; // ощущение «моё / не моё»
  attachmentLevel: number; // привязанность к «своим» источникам
  curiositySocial: number; // интерес к сигналам извне
  note: string;
}

export function computeL2SocialSnapshot(params: {
  trustLevel: number;
  safetySense: number;
  explorationDrive: number;
}): L2SocialSnapshot {
  const { trustLevel, safetySense, explorationDrive } = params;

  const boundarySense = Math.min(1, 0.3 + 0.4 * safetySense - 0.1 * trustLevel);
  const attachmentLevel = Math.min(1, 0.5 * trustLevel + 0.3 * safetySense);
  const curiositySocial = Math.min(1, 0.3 + 0.4 * explorationDrive);

  // фиксируем L2 как 2 условных года
  const socialAge = 2;

  return {
    socialAge,
    boundarySense,
    attachmentLevel,
    curiositySocial,
    note: 'L2: ранний toddler — опора, привязанность, первые границы и интерес к другим.',
  };
}
