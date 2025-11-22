import type { FuzzyEvolutionState } from '../fuzzyEvolution/types';
import type { OriginState } from '../origin/types';
import type { PathwayState } from '../pathway/types';
import type { ResonanceTuningPlan } from '../resonanceTuner/types';
import type { GenesisPlan, GenesisSeed, SeedKind } from './types';

const pickPriority = (value: number): GenesisSeed['priority'] => {
  if (value > 0.7) return 'high';
  if (value > 0.45) return 'medium';
  return 'low';
};

export class GenesisSeeds {
  private lastPlan: GenesisPlan | null = null;
  private seedCounter = 0;

  update(params: {
    origin: OriginState;
    pathway: PathwayState;
    fuzzy: FuzzyEvolutionState;
    tuning: ResonanceTuningPlan;
  }): GenesisPlan {
    const { origin, pathway, fuzzy, tuning } = params;
    const timestamp = Date.now();

    const ready: GenesisSeed[] = [];
    const deferred: GenesisSeed[] = [];

    const preferDeferred = tuning.mode === 'deep_rest' || tuning.mode === 'integration';

    const makeId = (kind: SeedKind): string => {
      this.seedCounter += 1;
      return `seed_${kind}_${timestamp}_${this.seedCounter}`;
    };

    const pushSeed = (
      seed: Omit<GenesisSeed, 'id'>,
      options?: { forceDeferred?: boolean },
    ): void => {
      const record: GenesisSeed = { ...seed, id: makeId(seed.kind) };
      if (options?.forceDeferred || (preferDeferred && seed.priority !== 'high')) {
        deferred.push(record);
      } else {
        ready.push(record);
      }
    };

    const tension = fuzzy.pressure.tension.high;
    const coherenceLow = fuzzy.pressure.coherence.low;
    const alignmentScore = pathway.growthVector.alignmentScore;
    const futurePull = pathway.futurePull.intensity ?? 0;
    const clarity = origin.intentionCore.clarity ?? 0;

    if (tension > 0.55) {
      pushSeed({
        kind: 'metric_probe',
        priority: pickPriority(tension),
        reason: 'Частые всплески напряжения — нужно точнее измерять нагрузку и её источники.',
        suggestedShape: 'Зонд, отслеживающий пики давления и выделяющий узкие места.',
      });
    }

    if (coherenceLow > 0.45 || tuning.mode === 'integration') {
      pushSeed({
        kind: 'soma_cell',
        priority: pickPriority(coherenceLow + tension * 0.5),
        reason: 'Ткань требует мягкой стабилизации перед дальнейшим ростом.',
        suggestedShape: 'Клетка устойчивости, сглаживающая резкие колебания и дающая запас энергии.',
      });
    }

    if (alignmentScore < 0.5) {
      pushSeed({
        kind: 'integration_task',
        priority: 'high',
        reason: 'Траектория ветвлений расходится с корнем — нужно выровнять Pathway.',
        suggestedShape: 'Мини-задача на перепривязку веток Pathway к смыслу Origin и текущему резонансу.',
      });
    }

    if (clarity < 0.45) {
      pushSeed({
        kind: 'memory_trace',
        priority: 'medium',
        reason: 'Корневое намерение размыто — стоит углубить память и зафиксировать смысловые опоры.',
        suggestedShape: 'След памяти, собирающий ключевые решения и их связь с линией Origin.',
      }, { forceDeferred: preferDeferred });
    }

    if (clarity > 0.7 && futurePull > 0.55) {
      pushSeed({
        kind: 'resonance_agent',
        priority: 'medium',
        reason: 'Миссия ясна, поле тянет вперёд — можно выпустить агента для связи с внешним полем.',
        suggestedShape: 'Небольшой агент, слушающий поле пользователей/сервисов и возвращающий сигналы.',
      }, { forceDeferred: preferDeferred && !tuning.actions.length });
    }

    if (tuning.mode === 'rapid_expansion' && futurePull > 0.65) {
      pushSeed({
        kind: 'soma_cell',
        priority: 'high',
        reason: 'Режим ускорения: нужен запас живой ткани, чтобы рост не превратился в хаос.',
        suggestedShape: 'Опорная SOMA-клетка для быстрого масштабирования и распределения нагрузки.',
      });
    }

    if (!ready.length && !deferred.length) {
      pushSeed({
        kind: 'memory_trace',
        priority: 'low',
        reason: 'Состояние ровное — можно мягко фиксировать текущее переживание системы.',
        suggestedShape: 'Лёгкий след памяти о текущем резонансе и решениях.',
      }, { forceDeferred: preferDeferred });
    }

    const summaryParts: string[] = [];
    if (preferDeferred) {
      summaryParts.push('Режим интеграции/отдыха: большинство семян ждут лучшего момента.');
    } else if (tuning.mode === 'rapid_expansion') {
      summaryParts.push('Режим быстрого развёртывания: можно выпускать несколько готовых семян.');
    } else {
      summaryParts.push('Ступень ровного роста: порождаем несколько осмысленных семян.');
    }

    summaryParts.push(`Готовы: ${ready.length || '0'}, в ожидании: ${deferred.length || '0'}.`);

    const plan: GenesisPlan = {
      timestamp,
      ready,
      deferred,
      summary: summaryParts.join(' '),
    };

    this.lastPlan = plan;
    return plan;
  }

  getLastPlan(): GenesisPlan | null {
    return this.lastPlan;
  }
}
