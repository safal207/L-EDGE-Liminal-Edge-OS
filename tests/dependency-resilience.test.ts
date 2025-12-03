import { describe, expect, it } from 'vitest';
import {
  LIMINAL_LAYERS_MANIFEST,
  getDependencies,
  getLayer,
  listLayers,
} from '../core/layers.manifest';

describe('Liminal Dependency System — Resilience & Stability', () => {
  it('loads existing layers without errors', () => {
    expect(() => listLayers()).not.toThrow();

    const layers = listLayers();
    expect(Array.isArray(layers)).toBe(true);
    expect(layers.length).toBeGreaterThan(0);
  });

  it('ensures L0 exists and has string dependency entries', () => {
    const l0 = getLayer('L0');
    expect(l0).toBeDefined();

    const deps = l0?.dependencies ?? [];
    deps.forEach((dep) => {
      expect(typeof dep).toBe('string');
      expect(dep.trim().length).toBeGreaterThan(0);
    });
  });

  it('returns an empty array for unknown dependency lookups', () => {
    expect(() => getDependencies('BAD_LAYER')).not.toThrow();

    const result = getDependencies('BAD_LAYER');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
  });

  it('treats each declared dependency as a valid adjacency', () => {
    const allIds = new Set(listLayers().map((layer) => layer.id));

    listLayers().forEach((layer) => {
      const deps = layer.dependencies ?? [];

      deps.forEach((dep) => {
        expect(allIds.has(dep)).toBe(true);
      });
    });
  });

  it('is tolerant to noisy dependency data shapes', () => {
    const malformed = { id: 'LX', dependencies: [null, 42, 'L0'] } as any;

    expect(() => {
      const filtered = (malformed.dependencies ?? []).filter(
        (dep: unknown): dep is string => typeof dep === 'string',
      );
      expect(filtered).toEqual(['L0']);
    }).not.toThrow();
  });

  it('resolves adjacency lists without throwing', () => {
    expect(() => getDependencies('L13')).not.toThrow();

    const dependencies = getDependencies('L13');
    const expected = LIMINAL_LAYERS_MANIFEST.find((layer) => layer.id === 'L13')
      ?.dependencies;

    expect(dependencies.map((layer) => layer.id)).toEqual(expected);
  });
});
