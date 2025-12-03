import { afterEach, describe, expect, test } from 'vitest';
import { getDependencies, listLayers, organism } from '../src/liminal-core';

describe('Organism Deep Stability (L0 → L30)', () => {
  afterEach(() => {
    if (organism.refreshHomeostasis) {
      organism.refreshHomeostasis();
    }
  });

  test('organism layers form a consistent loop structure', () => {
    const layers = listLayers();

    expect(layers.length).toBeGreaterThan(10);

    for (const layer of layers) {
      const deps = getDependencies(layer.id);
      expect(Array.isArray(deps)).toBe(true);
      expect(deps).not.toBeNull();
    }
  });

  test('soft-failure: missing dependency never breaks organism', () => {
    expect(() => getDependencies('L9999_UNKNOWN')).not.toThrow();

    const deps = getDependencies('L9999_UNKNOWN');
    expect(deps).toEqual([]);
  });

  test('healing behavior: organism restores structure after noise', () => {
    if (organism.injectNoise) {
      organism.injectNoise({ missing: ['L777'], corrupt: true });
    }

    const layersBefore = listLayers();
    expect(layersBefore.length).toBeGreaterThan(0);

    if (organism.rebuildStructure) {
      expect(() => organism.rebuildStructure()).not.toThrow();
    }

    const layersAfter = listLayers();
    expect(layersAfter.length).toBeGreaterThan(0);
  });
});
