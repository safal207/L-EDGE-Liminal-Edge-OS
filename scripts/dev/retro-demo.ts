import { createDecision } from "../../src/layers/L24_decision";
import {
  DecisionOutcome,
  ForesightSignal,
  generateForesightSignal,
  getForesightConfidenceScale,
  recordForesightSignal,
} from "../../src/layers/L31_foresight_engine";
import {
  RealizedOutcome,
  registerRealizedOutcome,
} from "../../src/core/outcomeRegistry";
import {
  getRecentRetrospectives,
  runRetrospectiveForDecision,
} from "../../src/layers/L32_retrospective";
import { getLuckBias } from "../../src/layers/L21_luck/calibration";

interface DemoScenario {
  label: string;
  decision: Omit<DecisionOutcome, "id" | "createdAt">;
  outcome: Pick<RealizedOutcome, "successScore" | "valence" | "predictability">;
  foresightOverrides?: Partial<Pick<ForesightSignal, "confidence" | "expectedImpact">>;
}

const baseTime = 1_700_000_000_000;

const scenarios: DemoScenario[] = [
  {
    label: "well_calibrated_win",
    decision: {
      kind: "demo",
      domain: "foresight",
      reward: 1,
      risk: 0.1,
      explorationValue: 0.9,
      tension: 0.1,
    },
    outcome: { successScore: 0.92, valence: "positive", predictability: 0.65 },
  },
  {
    label: "confident_miss",
    decision: {
      kind: "demo",
      domain: "foresight",
      reward: 0.9,
      risk: 0.2,
      explorationValue: 0.8,
      tension: 0.2,
    },
    outcome: { successScore: 0.25, valence: "positive", predictability: 0.35 },
  },
  {
    label: "cautious_but_successful",
    decision: {
      kind: "demo",
      domain: "foresight",
      reward: 0.45,
      risk: 0.4,
      explorationValue: 0.05,
      tension: 0.95,
    },
    outcome: { successScore: 0.9, valence: "positive", predictability: 0.55 },
    foresightOverrides: { confidence: 0.3, expectedImpact: "positive" },
  },
  {
    label: "ambivalent_guess",
    decision: {
      kind: "demo",
      domain: "foresight",
      reward: 0.5,
      risk: 0.6,
      explorationValue: 0.4,
      tension: 0.5,
    },
    outcome: { successScore: 0.55, valence: "mixed", predictability: 0.4 },
  },
  {
    label: "stable_step",
    decision: {
      kind: "demo",
      domain: "foresight",
      reward: 0.35,
      risk: 0.3,
      explorationValue: 0.15,
      tension: 0.2,
    },
    outcome: { successScore: 0.65, valence: "positive", predictability: 0.85 },
  },
];

function runDemoLoop(): void {
  console.log("=== Running foresight → outcome → retrospective demo ===");

  scenarios.forEach((scenario, index) => {
    const decision = createDecision({
      ...scenario.decision,
      id: `demo_decision_${index + 1}`,
      createdAt: baseTime + index * 10_000,
      tags: [scenario.label],
    });

    const foresight = {
      ...generateForesightSignal(decision),
      ...scenario.foresightOverrides,
    };
    recordForesightSignal(foresight);

    const realized: RealizedOutcome = {
      id: `outcome_${index + 1}`,
      decisionId: decision.id,
      occurredAt: decision.createdAt + 5_000,
      ...scenario.outcome,
    };

    registerRealizedOutcome(realized);
    const retrospective = runRetrospectiveForDecision(decision);

    console.log(
      `${scenario.label.padEnd(22)} :: foresight=${foresight.confidence.toFixed(2)} ` +
        `success=${realized.successScore.toFixed(2)} ` +
        `match=${retrospective?.matchQuality ?? "pending"}`,
    );
  });

  printSnapshot();
}

function printSnapshot(): void {
  console.log("\n=== L-EDGE RETRO SNAPSHOT ===");
  console.log("confidenceScale:", getForesightConfidenceScale().toFixed(3));
  console.log("luckBias:", getLuckBias().toFixed(3));

  const retros = getRecentRetrospectives(10);
  for (const r of retros) {
    console.log(
      `${r.createdAt} d=${r.decisionId} ` +
        `match=${r.matchQuality} ` +
        `conf=${r.foresightConfidence?.toFixed(2)} ` +
        `success=${r.outcomeSuccess?.toFixed(2)} ` +
        `surprise=${r.surpriseScore.toFixed(2)} ` +
        `learn=${r.learningSignal.toFixed(2)}`,
    );
  }
}

runDemoLoop();
