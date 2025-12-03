import { CalibrationMatchQuality } from "../types";
import { recordInsight } from "./L30_insights";
import {
  DecisionOutcome,
  ForesightSignal,
  applyForesightCalibration,
  getForesightByDecisionId,
} from "./L31_foresight_engine";
import {
  RealizedOutcome,
  getRealizedOutcomeByDecisionId,
} from "../core/outcomeRegistry";

export type ForesightMatchQuality = CalibrationMatchQuality;

export interface RetrospectiveRecord {
  id: string;
  decisionId: string;
  foresightId?: string;
  realizedOutcomeId?: string;
  createdAt: number;
  matchQuality: ForesightMatchQuality;
  foresightConfidence?: number;
  foresightImpact?: "positive" | "negative" | "ambivalent";
  outcomeSuccess?: number;
  outcomeValence?: RealizedOutcome["valence"];
  surpriseScore: number;
  learningSignal: number; // -1..+1
  notes?: string;
}

const MAX_RETROSPECTIVE_LOG = 10_000;
const retrospectiveLog: RetrospectiveRecord[] = [];

let luckCalibrationBias = 0;

export function recordRetrospective(entry: RetrospectiveRecord): void {
  retrospectiveLog.push(entry);
  if (retrospectiveLog.length > MAX_RETROSPECTIVE_LOG) {
    retrospectiveLog.shift();
  }
}

export function getRecentRetrospectives(limit = 100): RetrospectiveRecord[] {
  return retrospectiveLog.slice(-limit);
}

export function clearRetrospectives(): void {
  retrospectiveLog.length = 0;
}

export function runRetrospectiveForDecision(
  decision: DecisionOutcome,
): RetrospectiveRecord | null {
  const foresight = getForesightByDecisionId(decision.id);
  const realized = getRealizedOutcomeByDecisionId(decision.id);

  if (!foresight || !realized) {
    return null;
  }

  const { matchQuality, surpriseScore, learningSignal } =
    evaluateMatch(foresight, realized);

  const record: RetrospectiveRecord = {
    id: `retro_${Date.now()}`,
    decisionId: decision.id,
    foresightId: foresight.id,
    realizedOutcomeId: realized.id,
    createdAt: Date.now(),
    matchQuality,
    foresightConfidence: foresight.confidence,
    foresightImpact: foresight.expectedImpact,
    outcomeSuccess: realized.successScore,
    outcomeValence: realized.valence,
    surpriseScore,
    learningSignal,
  };

  recordRetrospective(record);
  applyCalibrationToSystem(record);

  return record;
}

export function evaluateMatch(
  foresight: ForesightSignal,
  realized: RealizedOutcome,
): {
  matchQuality: ForesightMatchQuality;
  surpriseScore: number;
  learningSignal: number;
} {
  const impactSign =
    foresight.expectedImpact === "positive"
      ? 1
      : foresight.expectedImpact === "negative"
      ? -1
      : 0;

  const outcomeSign =
    realized.valence === "positive"
      ? 1
      : realized.valence === "negative"
      ? -1
      : 0;

  const signMatch = impactSign * outcomeSign; // 1, 0, -1

  const confidence = foresight.confidence;
  const success = realized.successScore;

  let matchQuality: ForesightMatchQuality;
  let learningSignal = 0;

  if (signMatch > 0) {
    if (confidence > 0.7 && success > 0.7) {
      matchQuality = "well_calibrated";
      learningSignal = 0.2;
    } else if (confidence > 0.7 && success < 0.4) {
      matchQuality = "overconfident";
      learningSignal = -0.4;
    } else if (confidence < 0.4 && success > 0.7) {
      matchQuality = "underconfident";
      learningSignal = 0.4;
    } else {
      matchQuality = "well_calibrated";
      learningSignal = 0.1;
    }
  } else if (signMatch < 0) {
    if (confidence > 0.6) {
      matchQuality = "overconfident";
      learningSignal = -0.6;
    } else {
      matchQuality = "missed";
      learningSignal = -0.3;
    }
  } else {
    if (success > 0.6) {
      matchQuality = "lucky";
      learningSignal = 0.1;
    } else if (success < 0.4) {
      matchQuality = "unlucky";
      learningSignal = -0.1;
    } else {
      matchQuality = "missed";
      learningSignal = -0.1;
    }
  }

  const surpriseScore = clamp(1 - realized.predictability, 0, 1);

  return { matchQuality, surpriseScore, learningSignal: clamp(learningSignal, -1, 1) };
}

export function applyLuckCalibration(record: RetrospectiveRecord): number {
  if (record.matchQuality === "overconfident") {
    luckCalibrationBias = clamp(luckCalibrationBias - 0.05, -1, 1);
  } else if (record.matchQuality === "underconfident") {
    luckCalibrationBias = clamp(luckCalibrationBias + 0.05, -1, 1);
  }

  return luckCalibrationBias;
}

export function getLuckCalibrationBias(): number {
  return luckCalibrationBias;
}

export function resetLuckCalibration(): void {
  luckCalibrationBias = 0;
}

export function maybeEmitMetaInsight(record: RetrospectiveRecord): void {
  const strength = Math.abs(record.learningSignal);
  if (strength < 0.3) return;

  const polarity = record.learningSignal > 0 ? "positive" : "negative";
  const summary =
    record.matchQuality === "overconfident"
      ? "Организм был излишне самоуверен в этом решении"
      : record.matchQuality === "underconfident"
      ? "Организм недооценил свои верные оценки"
      : "Организм получил важный опыт калибровки";

  recordInsight({
    id: `meta_insight_${Date.now()}`,
    createdAt: Date.now(),
    sourceLayer: "L32",
    polarity,
    strength,
    scope: "system",
    topicTags: ["calibration", "foresight", "luck"],
    summary,
  });
}

function applyCalibrationToSystem(record: RetrospectiveRecord): void {
  applyLuckCalibration(record);
  applyForesightCalibration(record.matchQuality);
  maybeEmitMetaInsight(record);
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
