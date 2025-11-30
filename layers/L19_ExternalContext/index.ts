import { processSignal, ContextSignal } from "./ContextSignal";
import { evaluateRelevance } from "./ContextRelevance";
import { evaluatePressure } from "./ContextPressure";
import { calculateMeaningShift } from "./ContextMeaningShift";
import { evaluatePhaseImpact } from "./ContextPhaseImpact";
import { bridgeToInnerLayers, ContextBridgeOutput } from "./ContextBridge";

export const L19_ExternalContext = (
  signal: Partial<ContextSignal>
): ContextBridgeOutput => {
  const ctxSignal = processSignal(signal);
  const relevance = evaluateRelevance(ctxSignal);
  const pressure = evaluatePressure(ctxSignal, relevance);
  const meaning = calculateMeaningShift(ctxSignal, pressure);
  const phase = evaluatePhaseImpact(ctxSignal, pressure);

  return bridgeToInnerLayers({
    ctxSignal,
    relevance,
    pressure,
    meaning,
    phase,
  });
};

export * from "./ContextSignal";
export * from "./ContextRelevance";
export * from "./ContextPressure";
export * from "./ContextMeaningShift";
export * from "./ContextPhaseImpact";
export * from "./ContextBridge";
