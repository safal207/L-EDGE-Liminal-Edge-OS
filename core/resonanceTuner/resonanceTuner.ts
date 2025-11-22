import { v4 as uuidv4 } from 'uuid';
import type { FuzzyEvolutionState } from '../fuzzyEvolution/types';
import type { MetaSystemSnapshot } from '../metaOrchestrator/types';
import type { OriginState } from '../origin/types';
import type { PathwayState } from '../pathway/types';
import type {
  GlobalMode,
  ResonanceTunerConfig,
  ResonanceTuningPlan,
  TuningAction,
} from './types';

const pickId = (prefix?: string): string => `${prefix ?? 'tune'}-${uuidv4()}`;

const asScalar = (level: { low: number; medium: number; high: number }): number =>
  Math.max(0, Math.min(1, 0.2 * level.low + 0.5 * level.medium + 0.8 * level.high));

const pickMode = ({
  fuzzy,
  pathway,
}: {
  fuzzy: FuzzyEvolutionState;
  pathway: PathwayState;
}): GlobalMode => {
  const tensionScore = asScalar(fuzzy.pressure.tension);
  const coherenceScore = asScalar(fuzzy.pressure.coherence);
  const futurePull = pathway.futurePull.intensity ?? 0;
  const stringMode = fuzzy.strings.globalMode;

  if (stringMode === 'chaotic' || tensionScore > 0.75) {
    return coherenceScore > 0.35 ? 'integration' : 'deep_rest';
  }

  if (stringMode === 'damped') {
    return tensionScore > 0.45 ? 'integration' : 'deep_rest';
  }

  if (stringMode === 'resonant') {
    if (futurePull > 0.6 && tensionScore < 0.55) {
      return 'rapid_expansion';
    }
    return 'steady_growth';
  }

  if (tensionScore > 0.55 && coherenceScore < 0.4) {
    return 'integration';
  }

  if (tensionScore > 0.5 && coherenceScore > 0.5) {
    return 'careful_exploration';
  }

  return 'steady_growth';
};

const planActions = ({
  mode,
  fuzzy,
  pathway,
  config,
}: {
  mode: GlobalMode;
  fuzzy: FuzzyEvolutionState;
  pathway: PathwayState;
  config: ResonanceTunerConfig;
}): TuningAction[] => {
  const actions: TuningAction[] = [];
  const tension = fuzzy.pressure.tension;
  const coherence = fuzzy.pressure.coherence;
  const alignment = fuzzy.pressure.alignment;
  const futurePull = pathway.futurePull.intensity ?? 0;

  const add = (action: Omit<TuningAction, 'id'>) =>
    actions.push({ ...action, id: pickId(config.idPrefix) });

  if (tension.high > 0.55) {
    add({
      target: 'load',
      direction: 'decrease',
      intensity: tension.high > 0.75 ? 'strong' : 'medium',
      rationale: 'Высокое напряжение: снизьте внешнюю нагрузку и темп задач.',
    });
  }

  if (coherence.low > 0.4) {
    add({
      target: 'rest',
      direction: 'increase',
      intensity: coherence.low > 0.6 ? 'strong' : 'medium',
      rationale: 'Согласованность низкая: полезен режим интеграции и восстановления.',
    });
  }

  if (alignment.low > 0.35) {
    add({
      target: 'growth',
      direction: 'pause',
      intensity: 'medium',
      rationale: 'Путь расходится с корнем: притормозите рост и перепроверьте направление.',
    });
  }

  if (mode === 'rapid_expansion') {
    add({
      target: 'growth',
      direction: 'increase',
      intensity: 'medium',
      rationale: 'Резонанс устойчивый, поле тянет вперёд — можно ускорить развёртывание.',
    });
  }

  if (mode === 'careful_exploration') {
    add({
      target: 'exploration',
      direction: 'increase',
      intensity: 'soft',
      rationale: 'Колебания неоднородны: исследуйте аккуратно, сохраняя запас устойчивости.',
    });
  }

  if (actions.length === 0 && futurePull > 0.45) {
    add({
      target: 'growth',
      direction: 'stabilize',
      intensity: 'soft',
      rationale: 'Поле нейтрально: поддерживайте устойчивый рост без резких шагов.',
    });
  }

  return actions.length ? actions : [
    {
      id: pickId(config.idPrefix),
      target: 'rest',
      direction: 'stabilize',
      intensity: 'soft',
      rationale: 'Состояние ровное: сохраняйте мягкий режим и наблюдайте за волнами.',
    },
  ];
};

const summarize = (mode: GlobalMode, actions: TuningAction[]): string => {
  if (mode === 'deep_rest') {
    return 'Система просит глубокий отдых и снижение нагрузки.';
  }
  if (mode === 'integration') {
    return 'Полезно переварить накопленные колебания: интеграция и мягкое выравнивание.';
  }
  if (mode === 'rapid_expansion') {
    return 'Режим быстрого роста: поддерживайте резонанс и аккуратно усиливайте темп.';
  }
  if (mode === 'careful_exploration') {
    return 'Волны неоднородны: исследуйте новое осторожно, оставляя буфер устойчивости.';
  }
  const growthAction = actions.find((a) => a.target === 'growth' && a.direction === 'increase');
  if (growthAction) {
    return 'Согласованность достаточная: можно разворачивать рост, удерживая баланс.';
  }
  return 'Система в ровном резонансе: поддерживайте steady state и наблюдайте.';
};

export class ResonanceTuner {
  private lastPlan: ResonanceTuningPlan | null = null;
  private readonly config: ResonanceTunerConfig;

  constructor(config: ResonanceTunerConfig = {}) {
    this.config = config;
  }

  update({ fuzzy, meta, origin, pathway }: {
    fuzzy: FuzzyEvolutionState;
    meta: MetaSystemSnapshot | null;
    origin: OriginState;
    pathway: PathwayState;
  }): ResonanceTuningPlan {
    const mode = pickMode({ fuzzy, pathway });
    const actions = planActions({ mode, fuzzy, pathway, config: this.config });

    const summary = summarize(mode, actions);

    this.lastPlan = {
      timestamp: meta?.timestamp ?? Date.now(),
      mode,
      actions,
      summary,
    };

    return this.lastPlan;
  }

  getLastPlan(): ResonanceTuningPlan | null {
    return this.lastPlan;
  }
}
