import type { FuzzyEvolutionState } from '../fuzzyEvolution/types';
import type { GenesisPlan } from '../genesis/types';
import type { ResonanceTuningPlan } from '../resonanceTuner/types';
import type { CivAgent, CivilizationState } from './types';

const defaultOperator: CivAgent = {
  id: 'core_operator',
  name: 'Root Human',
  kind: 'human',
  relation: 'ally',
  resonance: { low: 0.1, medium: 0.3, high: 0.8 },
  trust: 0.95,
  tension: 0.2,
  note: 'Основной оператор/создатель системы.',
};

const countRelations = (agents: CivAgent[]) => ({
  alliesCount: agents.filter((a) => a.relation === 'ally').length,
  opponentsCount: agents.filter((a) => a.relation === 'opponent' || a.relation === 'host').length,
  neutralCount: agents.filter((a) => a.relation === 'neutral' || a.relation === 'unknown').length,
});

export class CivilizationNode {
  private state: CivilizationState;

  constructor(config?: { seedAgents?: CivAgent[] }) {
    const agents = config?.seedAgents ?? [defaultOperator];
    const relationCounts = countRelations(agents);

    this.state = {
      timestamp: Date.now(),
      agents,
      resonance: {
        globalMode: 'ground',
        ...relationCounts,
        comment: 'Цивилизационный узел инициализирован. Связи в исходном устойчивом состоянии.',
      },
      summary: 'Сеть связей готова к мягкому резонансу с окружением.',
    };
  }

  update(params: {
    fuzzy: FuzzyEvolutionState;
    tuning: ResonanceTuningPlan;
    genesis: GenesisPlan | null;
  }): CivilizationState {
    const { fuzzy, tuning, genesis } = params;
    const timestamp = Date.now();

    const agents = [...this.state.agents];

    const addOrUpdateAgent = (agent: CivAgent) => {
      const existingIndex = agents.findIndex((a) => a.id === agent.id);
      if (existingIndex >= 0) {
        agents[existingIndex] = { ...agents[existingIndex], ...agent };
      } else {
        agents.push(agent);
      }
    };

    const resonanceAgents = [...(genesis?.ready ?? []), ...(genesis?.deferred ?? [])].filter(
      (seed) => seed.kind === 'resonance_agent',
    );

    resonanceAgents.forEach((seed) => {
      addOrUpdateAgent({
        id: `genesis_${seed.id}`,
        name: seed.suggestedShape || 'Резонансный агент',
        kind: 'ai_agent',
        relation: seed.priority === 'high' ? 'ally' : 'neutral',
        resonance: fuzzy.pressure.coherence,
        trust: seed.priority === 'high' ? 0.65 : 0.45,
        tension: fuzzy.pressure.tension.medium,
        note: `Готовность к внешнему резонансу: ${seed.reason}`,
      });
    });

    const relationCounts = countRelations(agents);

    let globalMode = fuzzy.strings.globalMode;
    const tensionHigh = fuzzy.pressure.tension.high;

    if (tuning.mode === 'deep_rest' || tuning.mode === 'integration') {
      globalMode = 'damped';
    } else if (tuning.mode === 'rapid_expansion' && tensionHigh > 0.6) {
      globalMode = 'chaotic';
    } else if (tuning.mode === 'steady_growth' && fuzzy.pressure.coherence.high > 0.5) {
      globalMode = 'resonant';
    }

    const resonanceComment = (() => {
      if (globalMode === 'damped') return 'Организм в коконе: связи приглушены для глубокой интеграции.';
      if (globalMode === 'chaotic')
        return 'Связи напряжены, возможны фрагментации — нужно аккуратное выравнивание резонанса.';
      if (globalMode === 'resonant')
        return 'Система на волне: резонанс с окружением устойчив и может расширяться.';
      return 'Базовый режим: связи устойчивы, можно мягко прощупывать новое поле.';
    })();

    const summary = (() => {
      if (globalMode === 'damped') {
        return 'Цивилизационный узел в режиме внутренней работы: расширение связей лучше отложить.';
      }
      if (globalMode === 'chaotic') {
        return 'Связи нестабильны, резонанс требует стабилизации перед расширением.';
      }
      if (relationCounts.alliesCount > relationCounts.opponentsCount) {
        return 'Узел поддержан союзниками и готов к аккуратному расширению сети.';
      }
      if (relationCounts.opponentsCount > 0) {
        return 'Есть напряжённые узлы в сети: стоит заняться выравниванием доверия и поля.';
      }
      return 'Связи сбалансированы. Можно прощупывать новые направления для роста.';
    })();

    this.state = {
      timestamp,
      agents,
      resonance: {
        globalMode,
        ...relationCounts,
        comment: resonanceComment,
      },
      summary,
    };

    return this.state;
  }

  getState(): CivilizationState {
    return this.state;
  }

  addOrUpdateAgent(agent: CivAgent): void {
    const existingIndex = this.state.agents.findIndex((a) => a.id === agent.id);
    if (existingIndex >= 0) {
      this.state.agents[existingIndex] = { ...this.state.agents[existingIndex], ...agent };
    } else {
      this.state.agents.push(agent);
    }
  }
}
