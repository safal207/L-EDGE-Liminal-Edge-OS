export interface L2BodySnapshot {
  embodimentScore: number; // 0..1, насколько система «чувствует тело»
  stability: number; // устойчивость состояния
  explorationDrive: number; // тяга к исследованию через действие
  comfortInMotion: number; // насколько движение воспринимается как ок
  note: string;
}

export function computeL2BodyGrounding(inputs: {
  presence: number; // из L1
  trustLevel: number; // из L1
  noiseLevel: number; // ощущаемый «шум» среды
  signalClarity: number; // насколько понятны сигналы
}): L2BodySnapshot {
  const { presence, trustLevel, noiseLevel, signalClarity } = inputs;

  const embodimentScore = Math.min(1, 0.4 * presence + 0.3 * trustLevel + 0.3 * signalClarity);

  const stability = Math.max(0, 0.6 * presence + 0.2 * trustLevel - 0.3 * noiseLevel);

  const explorationDrive = Math.max(0, 0.3 + 0.4 * trustLevel + 0.2 * signalClarity - 0.2 * noiseLevel);

  const comfortInMotion = Math.min(1, 0.5 * stability + 0.3 * trustLevel + 0.2 * presence);

  return {
    embodimentScore,
    stability,
    explorationDrive,
    comfortInMotion,
    note: 'L2: тело, опора, движение и базовый комфорт в исследовании.',
  };
}
