// src/organism/social/social_child.ts

export interface L3SocialSnapshot {
  socialAge: number; // ~4–6
  socialPatternSense: number; // 0..1 — понимание "ролей" и реакций других
  cooperation: number; // склонность к совместной игре
  conflictSkill: number; // способность переживать и разруливать конфликты
  note: string;
}

export function computeL3SocialSnapshot(params: {
  l2Attachment: number; // из L2 (attachmentLevel)
  l2CuriositySocial: number; // из L2
  civAlliesCount: number; // из CivilizationNode
  civOpponentsCount: number; // из CivilizationNode
}): L3SocialSnapshot {
  const { l2Attachment, l2CuriositySocial, civAlliesCount, civOpponentsCount } = params;

  const total = civAlliesCount + civOpponentsCount || 1;
  const alliesRatio = civAlliesCount / total;

  const socialPatternSense = Math.min(1, 0.3 + 0.3 * l2CuriositySocial + 0.2 * alliesRatio);

  const cooperation = Math.min(1, 0.4 * l2Attachment + 0.3 * alliesRatio + 0.2 * l2CuriositySocial);

  const conflictSkill = Math.min(1, 0.2 + 0.3 * l2CuriositySocial + 0.3 * (1 - alliesRatio));

  // Условный возраст для L3
  const socialAge = 5;

  return {
    socialAge,
    socialPatternSense,
    cooperation,
    conflictSkill,
    note: 'L3: ребёнок в игре с другими — паттерны, кооперация и первые конфликты.',
  };
}
