export interface L1SocialSeed {
  socialAge: number; // 0 or 1
  trustLevel: number;
  safetySense: number;
  signalRecognition: number;
  note: string;
}

export function computeL1SocialSeed(params: {
  trustSeed: number;
  presence: number;
  sensitivity: number;
}): L1SocialSeed {
  const { trustSeed, presence, sensitivity } = params;

  const trustLevel = trustSeed;
  const safetySense = Math.max(0.1, presence * 0.6);
  const signalRecognition = sensitivity * 0.5;

  return {
    socialAge: 0,
    trustLevel,
    safetySense,
    signalRecognition,
    note: 'S0–S1: рождение доверия, безопасность, первые различения',
  };
}
