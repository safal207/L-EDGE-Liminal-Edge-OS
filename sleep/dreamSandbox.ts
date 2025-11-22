export interface DreamReport {
  iterations: number;
  imaginedLinks: number;
}

export const runDreamSandbox = (signalStrength: number, baseIterations = 3): DreamReport => {
  const normalizedStrength = Math.min(1, Math.max(0, signalStrength));
  const iterations = Math.max(baseIterations, Math.round(baseIterations * (1 + normalizedStrength)));
  const imaginedLinks = Math.round(iterations * normalizedStrength * 10);
  return { iterations, imaginedLinks };
};
