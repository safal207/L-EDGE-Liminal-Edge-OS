export type LiminalLayerCategory =
  | 'orientation'
  | 'foundation'
  | 'development'
  | 'meaning'
  | 'dynamics'
  | 'observer'
  | 'metabolism'
  | 'structure'
  | 'guidance'
  | 'interface'
  | 'action'
  | 'insight'
  | 'simulation'
  | 'stability'
  | 'temporal'
  | 'context'
  | 'decision'
  | 'flow'
  | 'narrative'
  | 'environment'
  | 'trajectory'
  | 'coordination'
  | 'execution'
  | 'circulation'
  | 'rhythm'
  | 'foresight'
  | (string & {});

export interface LiminalLayerSpec {
  id: `L${number}` | string;
  name: string;
  description: string;
  category: LiminalLayerCategory;
  dependencies: string[];
}

export type LiminalLayerManifest = LiminalLayerSpec[];

export const LIMINAL_LAYERS_MANIFEST: LiminalLayerManifest = [
  {
    id: 'L0',
    name: 'Orientation Core',
    description:
      'Diagnostic center that watches the three axes (inner, social, cosmic) and evaluates balance, polarity, and cerebellum smoothing.',
    category: 'orientation',
    dependencies: [],
  },
  {
    id: 'L1',
    name: 'Root of Being',
    description: 'Birth of presence and trust that seeds the three axes with the first sensitivity and sense of safety.',
    category: 'foundation',
    dependencies: [],
  },
  {
    id: 'L2',
    name: 'Body & Grounding',
    description: 'Embodiment and basic boundaries where the organism explores through movement and builds early safety patterns.',
    category: 'foundation',
    dependencies: ['L1'],
  },
  {
    id: 'L3',
    name: 'Play & Patterning',
    description: 'Playful scenario building and pattern weaving that turns experience into stories and repeating contours.',
    category: 'development',
    dependencies: ['L2'],
  },
  {
    id: 'L4',
    name: 'Mastery & Role Embedding',
    description: 'First stable skills, discipline, and role awareness that let the organism finish tasks and hold focus.',
    category: 'development',
    dependencies: ['L3'],
  },
  {
    id: 'L5',
    name: 'Meaning & Direction',
    description: 'Emerging inner compass and sense-making loop that links actions to purpose and reflection.',
    category: 'meaning',
    dependencies: ['L4'],
  },
  {
    id: 'L6',
    name: 'Resonance Field',
    description: 'Breathing wave engine across the three axes that shapes rhythms, phase shifts, and coherence presets.',
    category: 'dynamics',
    dependencies: ['L0'],
  },
  {
    id: 'L7',
    name: 'SomaFlow',
    description: 'Circulation of flows across axes, tracking inflow/outflow, pressure, fatigue risk, and suggested shifts.',
    category: 'dynamics',
    dependencies: ['L0', 'L6'],
  },
  {
    id: 'L8',
    name: 'Crystal Observer',
    description: 'Temporal observer that tracks trajectory alignment, polarity balance, and crystal stability signals.',
    category: 'observer',
    dependencies: ['L0', 'L6', 'L7'],
  },
  {
    id: 'L9',
    name: 'Metabolic Layer',
    description: 'Metabolic supervision of energy, stress, recovery, and overload risk across the tri-axis system.',
    category: 'metabolism',
    dependencies: ['L0', 'L6', 'L7'],
  },
  {
    id: 'L10',
    name: 'Crystal Growth & Harmony',
    description: 'Crystal harmony snapshot that blends axis imbalance and metabolic tension into preferred adjustments.',
    category: 'structure',
    dependencies: ['L0', 'L6', 'L7', 'L9'],
  },
  {
    id: 'L11',
    name: 'Growth Modes',
    description: 'Growth posture resolver that classifies the organism into gentle, intensive, therapeutic, stabilizing, exploratory, or frozen modes.',
    category: 'guidance',
    dependencies: ['L9', 'L10'],
  },
  {
    id: 'L12',
    name: 'External Signals',
    description: 'Protocol-agnostic nerve intake that buffers and aggregates external stress, recovery, and exploration signals.',
    category: 'interface',
    dependencies: [],
  },
  {
    id: 'L13',
    name: 'Response Layer',
    description: 'Action intent generator that converts organism state and external signals into throttling, recovery, and exploration hints.',
    category: 'action',
    dependencies: ['L9', 'L10', 'L11', 'L12'],
  },
  {
    id: 'L14',
    name: 'Systemic Atlas',
    description: 'Multi-dataset fingerprint that maps gates, paths, behaviors, competencies, and modulators from the current snapshot.',
    category: 'insight',
    dependencies: ['L9', 'L10', 'L11'],
  },
  {
    id: 'L15',
    name: 'Simulation Layer',
    description: 'Time-stepped engine that applies environment drivers and modulators, recording Atlas fingerprints and metrics per tick.',
    category: 'simulation',
    dependencies: ['L14'],
  },
  {
    id: 'L16',
    name: 'Autopoietic Multiframe Layer',
    description: 'Stability and immune cycle across near/mid/far frames that blends targets, compensates imbalance, and trains recovery.',
    category: 'stability',
    dependencies: ['L9', 'L10', 'L11', 'L12', 'L14'],
  },
  {
    id: 'L17',
    name: 'Temporal Self-Steering',
    description: 'Temporal state and steering layer that computes metastability, drift, and goal alignment to propose safe adjustments.',
    category: 'temporal',
    dependencies: ['L16'],
  },
  {
    id: 'L18',
    name: 'Meaning Kernel',
    description: 'Meaning-aware meta-layer that evaluates purpose, finiteness, and contentment to inform trajectory choices.',
    category: 'insight',
    dependencies: ['L17'],
  },
  {
    id: 'L19',
    name: 'External Context Layer',
    description: 'Environmental perception pipeline that normalizes events into pressure, meaning shifts, and temporal bridges.',
    category: 'context',
    dependencies: ['L17', 'L18'],
  },
  {
    id: 'L20',
    name: 'Resonant Decision Orchestrator',
    description: 'Resonant decision engine that scores candidate state transitions for coherence with time, meaning, context, and flow.',
    category: 'decision',
    dependencies: ['L17', 'L18', 'L19', 'L21'],
  },
  {
    id: 'L21',
    name: 'Flow Alignment Layer',
    description: 'Flow sensor that computes alignment index, luck windows, cooperative field, and flow suggestions from multi-layer inputs.',
    category: 'flow',
    dependencies: ['L14', 'L17', 'L18', 'L19'],
  },
  {
    id: 'L22',
    name: 'Narrative Field Engine',
    description: 'Narrative summarizer that turns Liminal events and metrics into concise, human-readable stories about system dynamics.',
    category: 'narrative',
    dependencies: ['L19', 'L21'],
  },
  {
    id: 'L23',
    name: 'Informational Fluid Substrate',
    description: 'Information medium that collects imprints, updates crystal patterns, and tracks phase/plasticity across regions.',
    category: 'environment',
    dependencies: ['L21', 'L22'],
  },
  {
    id: 'L24',
    name: 'Trajectory Harmonizer',
    description: 'Trajectory ranking layer that blends informational fluid state, luck vector, and risk to pick resonant scenarios.',
    category: 'trajectory',
    dependencies: ['L21', 'L23'],
  },
  {
    id: 'L25',
    name: 'CellKernel & Vision Coherence',
    description:
      'Metabolic coordination and perceptive integrity that gate energy, tension, temporal context, and vision score for loops.',
    category: 'coordination',
    dependencies: ['L21', 'L23', 'L24'],
  },
  {
    id: 'L26',
    name: 'Organelle Mesh & Mineral Matrix',
    description: 'Organelle registry and mineral scaffold that routes tasks, balances load, and preserves structural integrity.',
    category: 'execution',
    dependencies: ['L24', 'L25'],
  },
  {
    id: 'L27',
    name: 'Mineral & Nutrient Layer',
    description: 'Mineral and vitamin metabolism that fuels organelles, reinforces decision stamina, and supports regenerative balance.',
    category: 'metabolism',
    dependencies: ['L26'],
  },
  {
    id: 'L28',
    name: 'Circulation & Immunity Layer',
    description: 'Circulation, filtration, and immune repair that keep data flows clean, regulate rhythm, and heal stressed regions.',
    category: 'circulation',
    dependencies: ['L26', 'L27'],
  },
  {
    id: 'L29',
    name: 'Respiration & Rhythm Layer',
    description: 'Respiratory cadence that sets activity modes and timing so the organism breathes, rests, and accelerates safely.',
    category: 'rhythm',
    dependencies: ['L21', 'L28'],
  },
  {
    id: 'L30',
    name: 'Insight Field & Emergent Understanding',
    description: 'Insight layer that turns breath, nourishment, immunity, luck, and vision into flashes of new understanding.',
    category: 'insight',
    dependencies: ['L21', 'L25', 'L26', 'L27', 'L28', 'L29'],
  },
  {
    id: 'L31',
    name: 'Liminal Foresight Engine',
    description:
      'Foresight engine that senses weak future signals, projects branching trajectories, and gently steers toward coherent paths.',
    category: 'foresight',
    dependencies: ['L19', 'L20', 'L21', 'L30'],
  },
];

export const LAYERS_BY_ID = new Map<string, LiminalLayerSpec>(
  LIMINAL_LAYERS_MANIFEST.map((layer) => [layer.id, layer]),
);

export function listLayers(): LiminalLayerManifest {
  return LIMINAL_LAYERS_MANIFEST;
}

export function getLayer(id: string): LiminalLayerSpec | undefined {
  return LAYERS_BY_ID.get(id);
}

export function getDependencies(id: string): LiminalLayerSpec[] {
  const layer = LAYERS_BY_ID.get(id);

  if (!layer) {
    return [];
  }

  return layer.dependencies
    .map((dependencyId) => LAYERS_BY_ID.get(dependencyId))
    .filter((dependency): dependency is LiminalLayerSpec => Boolean(dependency));
}
