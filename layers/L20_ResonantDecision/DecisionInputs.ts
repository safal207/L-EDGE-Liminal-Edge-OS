import type { DecisionMode } from "./ResonantStateCandidate";

export type PhaseState = "solid" | "liquid" | "vapor";
export type PressureType = "support" | "challenge" | "neutral";

export interface DecisionInputs {
  time: {
    agePhase: string;
    tmi: number; // Time Misalignment Index
    drift: number;
  };
  meaning: {
    purposeAlignment: number;
    contentment: number;
    finiteness: number;
  };
  phase: {
    state: PhaseState;
    stability: number;
  };
  context: {
    pressureType: PressureType;
    pressureIntensity: number;
    relevance: number;
  };
  flow: {
    fai: number; // Flow Alignment Index
    innerAlignment: number;
    socialAlignment: number;
    cosmicAlignment: number;
    quality?: FlowQuality;
    luckWindowOpen: boolean;
    luckWindowStrength: number;
    luckWindowTiming?: LuckWindowTiming;
    cooperativeScore?: number;
    cooperativeMode?: CooperativeMode;
    mode: DecisionMode;
    confidence?: number;
    explain?: string[];
  };
}

export type FlowQuality = "low" | "medium" | "high";
export type LuckWindowTiming = "now" | "soon" | "later";
export type CooperativeMode = "solo" | "team" | "clustered";

export interface InnerStateInput {
  time?: Partial<DecisionInputs["time"]>;
  meaning?: Partial<DecisionInputs["meaning"]>;
  phase?: Partial<DecisionInputs["phase"]>;
}

export interface ContextStateInput extends Partial<DecisionInputs["context"]> {}
  export interface FlowStateInput extends Partial<DecisionInputs["flow"]> {
    alignment?: {
      fai?: number;
      inner_alignment?: number;
      innerAlignment?: number;
      social_alignment?: number;
      socialAlignment?: number;
      cosmic_alignment?: number;
      cosmicAlignment?: number;
      phase_fit?: number;
      phaseFit?: number;
      context_fit?: number;
      contextFit?: number;
      quality?: FlowQuality;
    };
    luck_window?: {
      is_open?: boolean;
      isOpen?: boolean;
      strength?: number;
      timing?: LuckWindowTiming;
      openness?: number;
    };
    luckWindow?: {
      is_open?: boolean;
      isOpen?: boolean;
      strength?: number;
      timing?: LuckWindowTiming;
      openness?: number;
    };
    flow_suggestion?: {
      mode?: DecisionMode;
      confidence?: number;
      explain?: string[];
    };
    flowSuggestion?: {
      mode?: DecisionMode;
      confidence?: number;
      explain?: string[];
    };
    cooperative_field?: {
      score?: number;
      mode?: CooperativeMode;
    };
    cooperativeField?: {
      score?: number;
      mode?: CooperativeMode;
    };
  }

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const defaults: DecisionInputs = {
  time: {
    agePhase: "Lx",
    tmi: 0,
    drift: 0,
  },
  meaning: {
    purposeAlignment: 0.5,
    contentment: 0.5,
    finiteness: 0.5,
  },
  phase: {
    state: "liquid",
    stability: 0.5,
  },
  context: {
    pressureType: "neutral",
    pressureIntensity: 0.3,
    relevance: 0.5,
  },
  flow: {
    fai: 0.5,
    innerAlignment: 0.5,
    socialAlignment: 0.5,
    cosmicAlignment: 0.5,
    quality: "medium",
    luckWindowOpen: false,
    luckWindowStrength: 0,
    luckWindowTiming: "later",
    cooperativeScore: 0,
    cooperativeMode: "solo",
    mode: "stabilize",
    confidence: 0.5,
    explain: [],
  },
};

const clampInputs = (input: DecisionInputs): DecisionInputs => ({
  time: {
    agePhase: input.time.agePhase,
    tmi: clamp01(input.time.tmi),
    drift: clamp01(input.time.drift),
  },
  meaning: {
    purposeAlignment: clamp01(input.meaning.purposeAlignment),
    contentment: clamp01(input.meaning.contentment),
    finiteness: clamp01(input.meaning.finiteness),
  },
  phase: {
    state: input.phase.state,
    stability: clamp01(input.phase.stability),
  },
  context: {
    pressureType: input.context.pressureType,
    pressureIntensity: Math.max(0, input.context.pressureIntensity),
    relevance: clamp01(input.context.relevance),
  },
  flow: {
    fai: clamp01(input.flow.fai),
    innerAlignment: clamp01(input.flow.innerAlignment),
    socialAlignment: clamp01(input.flow.socialAlignment),
    cosmicAlignment: clamp01(input.flow.cosmicAlignment),
    quality: input.flow.quality,
    luckWindowOpen: Boolean(input.flow.luckWindowOpen),
    luckWindowStrength: clamp01(input.flow.luckWindowStrength),
    luckWindowTiming: input.flow.luckWindowTiming,
    cooperativeScore: clamp01(input.flow.cooperativeScore ?? 0),
    cooperativeMode: input.flow.cooperativeMode,
    mode: input.flow.mode,
    confidence: clamp01(input.flow.confidence ?? 0.5),
    explain: input.flow.explain ?? [],
  },
});

const extractFlowState = (flowState: FlowStateInput = {}): Partial<DecisionInputs["flow"]> => {
  const fromL21 =
    "alignment" in flowState ||
    "luck_window" in flowState ||
    "luckWindow" in flowState ||
    "flow_suggestion" in flowState ||
    "flowSuggestion" in flowState;

  if (!fromL21) return flowState;

  const alignment = flowState.alignment ?? {};
  const luck = flowState.luck_window ?? flowState.luckWindow ?? {};
  const suggestion = flowState.flow_suggestion ?? flowState.flowSuggestion ?? {};
  const cooperative = flowState.cooperative_field ?? flowState.cooperativeField ?? {};

  return {
    fai: alignment.fai,
    innerAlignment: alignment.inner_alignment ?? alignment.innerAlignment,
    socialAlignment: alignment.social_alignment ?? alignment.socialAlignment,
    cosmicAlignment: alignment.cosmic_alignment ?? alignment.cosmicAlignment,
    quality: alignment.quality,
    luckWindowOpen: luck.is_open ?? luck.isOpen,
    luckWindowStrength: luck.strength,
    luckWindowTiming: luck.timing,
    cooperativeScore: cooperative.score,
    cooperativeMode: cooperative.mode,
    mode: suggestion.mode,
    confidence: suggestion.confidence,
    explain: flowState.flow_explain ?? flowState.flowExplain ?? suggestion.explain,
  };
};

const normalizeFlowMode = (mode?: DecisionMode): DecisionMode => {
  const modes: DecisionMode[] = [
    "stabilize",
    "explore",
    "push",
    "pivot",
    "slow_down",
    "connect",
    "rest",
  ];
  return modes.includes(mode as DecisionMode) ? (mode as DecisionMode) : "stabilize";
};

export const buildDecisionInputs = (
  innerState: InnerStateInput = {},
  contextState: ContextStateInput = {},
  flowState: FlowStateInput = {}
): DecisionInputs => {
  const merged: DecisionInputs = {
    time: { ...defaults.time, ...(innerState.time || {}) },
    meaning: { ...defaults.meaning, ...(innerState.meaning || {}) },
    phase: { ...defaults.phase, ...(innerState.phase || {}) },
    context: { ...defaults.context, ...contextState },
    flow: { ...defaults.flow, ...extractFlowState(flowState) },
  };
  merged.flow.mode = normalizeFlowMode(merged.flow.mode);
  return clampInputs(merged);
};
