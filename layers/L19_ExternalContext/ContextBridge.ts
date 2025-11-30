import { ContextSignal } from "./ContextSignal";
import { ContextMeaningShift } from "./ContextMeaningShift";
import { ContextPhaseImpact } from "./ContextPhaseImpact";
import { ContextPressure } from "./ContextPressure";
import { ContextRelevance } from "./ContextRelevance";

export interface ContextBridgeInput {
  ctxSignal: ContextSignal;
  relevance: ContextRelevance;
  pressure: ContextPressure;
  meaning: ContextMeaningShift;
  phase: ContextPhaseImpact;
}

export interface ContextBridgeOutput extends ContextBridgeInput {
  toL17: {
    temporalWeight: number;
    pressureColor: string;
  };
  toL18: {
    deltaMeaning: number;
    axis: ContextMeaningShift["affectedAxis"];
    pressureType: ContextPressure["pressureType"];
  };
  toPhase: {
    shift: ContextPhaseImpact["phaseShift"];
    strength: number;
  };
  summary: string;
}

export const bridgeToInnerLayers = (
  bundle: ContextBridgeInput
): ContextBridgeOutput => {
  const temporalWeight = Math.min(1, bundle.relevance.relevance * 0.6 + bundle.pressure.intensity * 0.4);

  const summary = [
    `source=${bundle.ctxSignal.source}`,
    `type=${bundle.ctxSignal.type}`,
    `reason=${bundle.relevance.reason}`,
    `relevance=${bundle.relevance.relevance.toFixed(2)}`,
    `pressure=${bundle.pressure.intensity.toFixed(2)}(${bundle.pressure.color})`,
    `meaningDelta=${bundle.meaning.deltaMeaning.toFixed(2)}@${bundle.meaning.affectedAxis}`,
    `phase=${bundle.phase.phaseShift}`,
  ].join(" | ");

  return {
    ...bundle,
    toL17: {
      temporalWeight,
      pressureColor: bundle.pressure.color,
    },
    toL18: {
      deltaMeaning: bundle.meaning.deltaMeaning,
      axis: bundle.meaning.affectedAxis,
      pressureType: bundle.pressure.pressureType,
    },
    toPhase: {
      shift: bundle.phase.phaseShift,
      strength: bundle.phase.impactStrength,
    },
    summary,
  };
};
