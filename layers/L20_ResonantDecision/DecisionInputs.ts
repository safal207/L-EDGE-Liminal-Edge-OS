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
    luckWindowOpen: boolean;
    luckWindowStrength: number;
  };
}

export interface InnerStateInput {
  time?: Partial<DecisionInputs["time"]>;
  meaning?: Partial<DecisionInputs["meaning"]>;
  phase?: Partial<DecisionInputs["phase"]>;
}

export interface ContextStateInput extends Partial<DecisionInputs["context"]> {}
export interface FlowStateInput extends Partial<DecisionInputs["flow"]> {}

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
    luckWindowOpen: false,
    luckWindowStrength: 0,
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
    luckWindowOpen: Boolean(input.flow.luckWindowOpen),
    luckWindowStrength: clamp01(input.flow.luckWindowStrength),
  },
});

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
    flow: { ...defaults.flow, ...flowState },
  };

  return clampInputs(merged);
};
