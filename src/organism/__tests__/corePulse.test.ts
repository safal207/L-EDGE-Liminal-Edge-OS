import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { SenseState } from '../../sense/types';
import type { BodyFatigueSnapshot } from '../../../interoception/contracts';
import type { SleepPlan } from '../../../sleep/sleepCycle';
import { runPulse } from '../corePulse';
import { LiminalSense } from '../../sense/sense';
import { computeBodyFatigueSnapshot } from '../../../interoception/interoceptionEngine';
import { planSleep } from '../../../sleep/sleepCycle';

type Mocked<T> = T & { mock: ReturnType<typeof vi.fn> };

vi.mock('../../sense/sense', () => ({
  LiminalSense: { process: vi.fn() },
}));

vi.mock('../../../interoception/interoceptionEngine', () => ({
  computeBodyFatigueSnapshot: vi.fn(),
}));

vi.mock('../../../sleep/sleepCycle', () => ({
  planSleep: vi.fn(),
}));

describe('runPulse', () => {
  const baseSenseState: SenseState = {
    mood: 'neutral',
    emotionalGradient: {
      calm: 0.5,
      tension: 0.2,
      curiosity: 0.5,
      fatigue: 0.2,
      uplift: 0.5,
      groundedness: 0.6,
      focus: 0.5,
      confidence: 0.55,
    },
    drift: 'stable',
    luck: { resonance: 0.4, phase: 'neutral' },
    reflection: { loadLevel: 0.3, integrationHealth: 0.7, suggestedMode: 'ground' },
    readiness: 'medium',
    suggestion: 'stabilize',
  };

  const senseMock = LiminalSense.process as unknown as Mocked<typeof LiminalSense.process>;
  const fatigueMock = computeBodyFatigueSnapshot as unknown as Mocked<typeof computeBodyFatigueSnapshot>;
  const planSleepMock = planSleep as unknown as Mocked<typeof planSleep>;

  beforeEach(() => {
    vi.clearAllMocks();
    senseMock.mockReturnValue(baseSenseState);
  });

  it('returns normal tone with low fatigue and no sleep plan', async () => {
    const fatigueSnapshot: BodyFatigueSnapshot = {
      fatigueLevel: 0.3,
      depletionLevel: 0.2,
      recoveryNeed: 0.3,
      suggestedSleepMode: 'light',
    };
    fatigueMock.mockReturnValue(fatigueSnapshot);

    const pulse = await runPulse({ timestamp: 1000 });

    expect(pulse.beat).toBe(1);
    expect(pulse.tone).toBe('normal');
    expect(pulse.sleepPlan).toBeUndefined();
  });

  it('creates restoration tone and sleep plan under medium fatigue', async () => {
    const fatigueSnapshot: BodyFatigueSnapshot = {
      fatigueLevel: 0.75,
      depletionLevel: 0.5,
      recoveryNeed: 0.7,
      suggestedSleepMode: 'deep',
    };
    fatigueMock.mockReturnValue(fatigueSnapshot);

    const sleepPlan: SleepPlan = {
      mode: 'integrative',
      cycles: 3,
      recoveryEmphasis: 0.6,
      replayEmphasis: 0.7,
    };
    planSleepMock.mockReturnValue(sleepPlan);

    const pulse = await runPulse({ timestamp: 2000 });

    expect(pulse.tone).toBe('restoration');
    expect(pulse.sleepPlan).toEqual(sleepPlan);
  });

  it('moves to sleeping tone under extreme fatigue and increments beat', async () => {
    const fatigueSnapshot: BodyFatigueSnapshot = {
      fatigueLevel: 0.9,
      depletionLevel: 0.9,
      recoveryNeed: 0.9,
      suggestedSleepMode: 'emergency',
    };
    fatigueMock.mockReturnValue(fatigueSnapshot);

    const sleepPlan: SleepPlan = {
      mode: 'deep',
      cycles: 4,
      recoveryEmphasis: 0.8,
      replayEmphasis: 0.1,
    };
    planSleepMock.mockReturnValue(sleepPlan);

    const previousPulse = await runPulse({ timestamp: 3000 });
    const nextPulse = await runPulse({ timestamp: 4000, previousPulse });

    expect(previousPulse.beat).toBe(1);
    expect(nextPulse.beat).toBe(2);
    expect(nextPulse.tone).toBe('sleeping');
    expect(nextPulse.sleepPlan).toEqual(sleepPlan);
  });
});
