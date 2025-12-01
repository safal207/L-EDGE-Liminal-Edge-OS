import {
  InformationalFluidSnapshot,
  FluidRegionState,
} from "../../src/layers/L23_informational_fluid";
import {
  TrajectoryHarmonizer,
  TrajectoryHarmonizerConfig,
  TrajectoryCandidate,
  DecisionContext,
  LuckVector,
} from "../../src/layers/L24_trajectory_harmonizer";

// ---------- 1. Состояние среды (L23) ----------
const now = Date.now();

const fluidSnapshot: InformationalFluidSnapshot = {
  lastGlobalUpdate: now,
  regions: {
    finance: <FluidRegionState>{
      regionId: "finance",
      pattern: {
        regionId: "finance",
        lastUpdated: now,
        coherence: 0.7,
        supportiveWeight: 0.4,
        stressWeight: 0.2,
        conflictWeight: 0.1,
        neutralWeight: 0.3,
        phase: "metastable",
        plasticity: 0.6,
        inertia: 0.6,
      },
      recentImprints: [],
    },
    family: <FluidRegionState>{
      regionId: "family",
      pattern: {
        regionId: "family",
        lastUpdated: now,
        coherence: 0.8,
        supportiveWeight: 0.5,
        stressWeight: 0.1,
        conflictWeight: 0.1,
        neutralWeight: 0.3,
        phase: "fluid",
        plasticity: 0.7,
        inertia: 0.5,
      },
      recentImprints: [],
    },
    health: <FluidRegionState>{
      regionId: "health",
      pattern: {
        regionId: "health",
        lastUpdated: now,
        coherence: 0.9,
        supportiveWeight: 0.1,
        stressWeight: 0.2,
        conflictWeight: 0.6,
        neutralWeight: 0.1,
        phase: "frozen",
        plasticity: 0.2,
        inertia: 0.9,
      },
      recentImprints: [],
    },
  },
};

// ---------- 2. Вектор воли / удачи (L21) ----------
const luck: LuckVector = {
  focusTags: ["stability", "long-term", "family-safe"],
  riskAppetite: 0.4, // умеренный риск
  changeDrive: 0.6, // хочется изменений, но без разрушения
};

// ---------- 3. Кандидаты-траектории ----------
const candidates: TrajectoryCandidate[] = [
  {
    id: "T1",
    label: "Aggressive financial pivot",
    originLayer: "agent:strategist",
    steps: [
      {
        description: "Radical reallocation of financial resources",
        involvedRegions: ["finance", "health"],
        tags: ["growth", "risk"],
      },
    ],
    predictedGain: 0.9,
    predictedCost: 0.8,
    predictedRisk: 0.8,
    timeHorizonMs: 180 * 24 * 60 * 60 * 1000, // 6 месяцев
    tags: ["aggressive", "high-risk", "short-term"],
  },
  {
    id: "T2",
    label: "Gentle course correction",
    originLayer: "agent:strategist",
    steps: [
      {
        description: "Gradual adjustment of financial strategy",
        involvedRegions: ["finance", "family"],
        tags: ["stability", "growth"],
      },
    ],
    predictedGain: 0.7,
    predictedCost: 0.4,
    predictedRisk: 0.5,
    timeHorizonMs: 365 * 24 * 60 * 60 * 1000, // 1 год
    tags: ["stability", "long-term", "family-safe"],
  },
  {
    id: "T3",
    label: "Maintain current state",
    originLayer: "agent:conservative",
    steps: [
      {
        description: "Keep current strategy without major changes",
        involvedRegions: ["finance"],
        tags: ["conservative"],
      },
    ],
    predictedGain: 0.1,
    predictedCost: 0.1,
    predictedRisk: 0.1,
    timeHorizonMs: 365 * 24 * 60 * 60 * 1000,
    tags: ["status-quo", "low-risk"],
  },
];

// ---------- 4. Контекст решения ----------
const context: DecisionContext = {
  goalDescription: "Optimize financial trajectory with minimal harm to health and family",
  horizonMs: 365 * 24 * 60 * 60 * 1000,
  hardConstraints: ["avoid:critical-health-impact"],
  preferredRegions: ["family"],
  forbiddenRegions: [],
  timestamp: now,
};

// ---------- 5. Конфиг гармонизатора ----------
const config: TrajectoryHarmonizerConfig = {
  weightResonance: 0.4,
  weightLuck: 0.3,
  weightRisk: 0.4,
  weightGain: 0.5,
};

// ---------- 6. Запуск демо ----------
const harmonizer = new TrajectoryHarmonizer(config);

const decision = harmonizer.decide(candidates, context, fluidSnapshot, luck);

console.log("Chosen trajectory:", decision.chosen?.id, decision.chosen?.label);
console.log("Reason:", decision.reasonSummary);
console.table(
  decision.ranked.map((r) => ({
    id: r.trajectory.id,
    label: r.trajectory.label,
    resonance: r.scores.resonanceScore.toFixed(2),
    luck: r.scores.luckAlignment.toFixed(2),
    envRisk: r.scores.environmentRisk.toFixed(2),
    structRisk: r.scores.structuralRisk.toFixed(2),
    combined: r.scores.combinedScore.toFixed(3),
  })),
);
