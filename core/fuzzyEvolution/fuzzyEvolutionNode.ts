import { clamp } from '../../meta/patternDetector';
import type { MetaSystemSnapshot } from '../metaOrchestrator/types';
import type { OriginState } from '../origin/types';
import type { PathwayState } from '../pathway/types';
import type {
  FuzzyEvolutionConfig,
  FuzzyEvolutionHistory,
  FuzzyEvolutionState,
  FuzzyEvolutionUpdateInput,
  FuzzyLevel,
  FuzzyPressure,
  FuzzySuggestion,
  StringFieldState,
  StringMode,
} from './types';

const DEFAULT_HISTORY_LIMIT = 120;

export const fuzzyFromScalar = (raw: number): FuzzyLevel => {
  const x = Number.isFinite(raw) ? clamp(raw) : 0;
  const low = Math.max(0, 1 - x * 2);
  const high = Math.max(0, (x - 0.5) * 2);
  const medium = Math.max(0, 1 - Math.abs(x - 0.5) * 4);
  return { low: clamp(low), medium: clamp(medium), high: clamp(high) };
};

const describeStringMode = (mode: StringMode, pressure: FuzzyPressure): string => {
  switch (mode) {
    case 'resonant':
      return 'Система вибрирует в устойчивом резонансе: согласованность высока, напряжение управляемо.';
    case 'chaotic':
      return 'Колебания хаотичны: напряжение высокое и неустойчивое, требуется смягчение.';
    case 'damped':
      return 'Колебания приглушены: мало энергии, сигналы поглощаются или не доходят до ткани системы.';
    case 'ground':
    default:
      if (pressure.coherence.high > 0.6 && pressure.tension.low > 0.5) {
        return 'Система в базовом спокойствии с хорошей согласованностью.';
      }
      return 'Базовый режим: стабильные низкие колебания без выраженного резонанса.';
  }
};

const buildSuggestions = (mode: StringMode, pressure: FuzzyPressure): FuzzySuggestion[] => {
  const suggestions: FuzzySuggestion[] = [];
  if (mode === 'chaotic') {
    suggestions.push({
      id: 'soften-chaos',
      message: 'Снизьте скорость роста и усилите стабилизацию, чтобы погасить хаотические перескоки.',
      severity: 'strong',
    });
    if (pressure.alignment.low > 0.4) {
      suggestions.push({
        id: 'realign-origin',
        message: 'Согласуйте траекторию с корневым вектором, чтобы вернуть резонанс.',
        severity: 'medium',
      });
    }
  }

  if (mode === 'damped') {
    suggestions.push({
      id: 're-energize',
      message: 'Добавьте энергии через лёгкие сигналы или отдых, чтобы раскрыть колебания.',
      severity: 'medium',
    });
  }

  if (mode === 'resonant') {
    suggestions.push({
      id: 'keep-resonance',
      message: 'Поддерживайте текущий темп роста, избегая резких скачков нагрузки.',
      severity: 'soft',
    });
  }

  if (mode === 'ground' && pressure.tension.medium > 0.4) {
    suggestions.push({
      id: 'watch-ripples',
      message: 'Растёт лёгкое напряжение. Следите за микроколебаниями, чтобы не сорваться в хаос.',
      severity: 'soft',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({ id: 'observe', message: 'Наблюдайте за колебаниями, корректируя темп мягко.', severity: 'soft' });
  }

  return suggestions;
};

const summarize = (mode: StringMode, pressure: FuzzyPressure): string => {
  if (mode === 'chaotic') {
    return 'Система колеблется на границе резонанса и хаоса. Требуется смягчение и возвращение согласованности.';
  }
  if (mode === 'damped') {
    return 'Колебания приглушены, полезно аккуратно подать энергию или снизить торможение.';
  }
  if (mode === 'resonant') {
    return 'Система вибрирует в устойчивом резонансе, допустим плавный рост.';
  }
  return 'Базовый режим: спокойные колебания с мягким давлением эволюции.';
};

export class FuzzyEvolutionNode {
  private state: FuzzyEvolutionState;
  private history: FuzzyEvolutionHistory;
  private readonly maxHistory: number;

  constructor(config: FuzzyEvolutionConfig = {}) {
    this.maxHistory = config.maxHistory ?? DEFAULT_HISTORY_LIMIT;
    this.history = { meta: [], origin: [], pathway: [] };
    const initialPressure: FuzzyPressure = {
      tension: { low: 1, medium: 0, high: 0 },
      coherence: { low: 0, medium: 1, high: 0 },
      alignment: { low: 0, medium: 1, high: 0 },
    };
    this.state = {
      timestamp: Date.now(),
      cyclesObserved: 0,
      pressure: initialPressure,
      strings: { globalMode: 'ground', comment: describeStringMode('ground', initialPressure) },
      suggestions: [
        {
          id: 'observe',
          message: 'Наблюдайте за колебаниями, корректируя темп мягко.',
          severity: 'soft',
        },
      ],
      summary: 'Fuzzy evolution инициализирован: базовое спокойствие.',
    };
  }

  update({ meta, origin, pathway }: FuzzyEvolutionUpdateInput): FuzzyEvolutionState {
    this.pushHistory(meta, origin, pathway);
    const tensionScalar = clamp(meta.meta.tension ?? 0);
    const coherenceScalar = clamp(meta.meta.coherence ?? 0);
    const alignmentScalar = clamp((pathway.growthVector.alignmentScore + (origin.intentionCore.clarity ?? 0)) / 2);

    const pressure: FuzzyPressure = {
      tension: fuzzyFromScalar(tensionScalar),
      coherence: fuzzyFromScalar(coherenceScalar),
      alignment: fuzzyFromScalar(alignmentScalar),
    };

    const strings = this.deriveStringField(pressure);
    const suggestions = buildSuggestions(strings.globalMode, pressure);

    this.state = {
      timestamp: meta.timestamp ?? Date.now(),
      cyclesObserved: this.history.meta.length,
      pressure,
      strings,
      suggestions,
      summary: summarize(strings.globalMode, pressure),
    };

    return this.state;
  }

  getState(): FuzzyEvolutionState {
    return this.state;
  }

  private deriveStringField(pressure: FuzzyPressure): StringFieldState {
    const { tension, coherence } = pressure;

    if (tension.high > 0.6 && coherence.low > 0.4) {
      return { globalMode: 'chaotic', comment: describeStringMode('chaotic', pressure) };
    }

    if (coherence.high > 0.45 && tension.low >= tension.medium) {
      return { globalMode: 'resonant', comment: describeStringMode('resonant', pressure) };
    }

    if (tension.low > 0.6 && coherence.low > coherence.high) {
      return { globalMode: 'damped', comment: describeStringMode('damped', pressure) };
    }

    if (coherence.medium > 0.4 && tension.low > tension.medium) {
      return { globalMode: 'ground', comment: describeStringMode('ground', pressure) };
    }

    return { globalMode: 'resonant', comment: describeStringMode('resonant', pressure) };
  }

  private pushHistory(meta: MetaSystemSnapshot, origin: OriginState, pathway: PathwayState) {
    this.history.meta.push(meta);
    this.history.origin.push(origin);
    this.history.pathway.push(pathway);

    const trim = (arr: unknown[]): void => {
      while (arr.length > this.maxHistory) {
        arr.shift();
      }
    };

    trim(this.history.meta);
    trim(this.history.origin);
    trim(this.history.pathway);
  }
}
