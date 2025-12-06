import { describe, expect, it } from 'vitest';
import { LiminalFieldBond } from '../LiminalFieldBond';
import { BondState } from '../contracts';

describe('LiminalFieldBond', () => {
  it('returns the initial bond', () => {
    const initial = LiminalFieldBond.initial();

    expect(initial.strength).toBeCloseTo(0.3, 1);
    expect(initial.closeness).toBe('cautious');
    expect(initial.stability).toBe('stable');
    expect(initial.safeToDeepen).toBeGreaterThan(0.3);
    expect(initial.softeningNeeded).toBeLessThanOrEqual(0.1);
  });

  it('creates a gentle engaged bond when trust and resonance are high', () => {
    const previous = LiminalFieldBond.initial();
    const bond = LiminalFieldBond.updateBondState({
      human: {
        trustSignal: 0.9,
        emotionalIntensity: 0.45,
        humanFatigue: 0.1,
        declaredProximity: 0.8,
      },
      organism: {
        mood: 'soft-rise',
        resonance: 0.7,
        drift: 'stable',
        pulseTone: 'normal',
      },
      previous,
    });

    expect(bond.strength).toBeGreaterThan(0.5);
    expect(bond.strength).toBeLessThan(0.85);
    expect(bond.closeness).toBe('engaged');
    expect(bond.stability).toBe('stable');
    expect(bond.safeToDeepen).toBeGreaterThan(0.6);
    expect(bond.modeTag).toBe('gentle');
  });

  it('keeps overloaded bonds fragile and softened', () => {
    const previous: BondState = {
      closeness: 'engaged',
      stability: 'stable',
      strength: 0.55,
      safeToDeepen: 0.55,
      softeningNeeded: 0.35,
      modeTag: 'gentle',
    };

    const bond = LiminalFieldBond.updateBondState({
      human: {
        trustSignal: 0.6,
        emotionalIntensity: 0.85,
        humanFatigue: 0.8,
        declaredProximity: 0.6,
      },
      organism: {
        mood: 'overloaded',
        resonance: 0.4,
        drift: 'oscillating',
        pulseTone: 'strained',
      },
      previous,
    });

    expect(bond.strength).toBeLessThanOrEqual(previous.strength);
    expect(['fragile', 'oscillating']).toContain(bond.stability);
    expect(bond.safeToDeepen).toBeLessThan(0.4);
    expect(bond.softeningNeeded).toBeGreaterThan(0.6);
    expect(['fragile', 'recalibrate']).toContain(bond.modeTag);
  });

  it('drops into distant recalibration when trust collapses', () => {
    const previous: BondState = {
      closeness: 'engaged',
      stability: 'stable',
      strength: 0.65,
      safeToDeepen: 0.7,
      softeningNeeded: 0.25,
      modeTag: 'gentle',
    };

    const bond = LiminalFieldBond.updateBondState({
      human: {
        trustSignal: 0.1,
        declaredProximity: 0.1,
        emotionalIntensity: 0.2,
        humanFatigue: 0.3,
      },
      organism: {
        mood: 'neutral',
        resonance: 0.3,
        drift: 'falling',
        pulseTone: 'normal',
      },
      previous,
    });

    expect(bond.strength).toBeLessThan(0.4);
    expect(['distant', 'cautious']).toContain(bond.closeness);
    expect(bond.safeToDeepen).toBeLessThan(0.5);
    expect(bond.softeningNeeded).toBeGreaterThan(0.3);
    expect(['recalibrate', 'distant']).toContain(bond.modeTag);
  });
});
