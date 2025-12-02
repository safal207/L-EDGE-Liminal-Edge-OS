import { describe, expect, it } from 'vitest';
import { LIMINAL_LAYERS_MANIFEST } from '../core/layers.manifest';

describe('LIMINAL_LAYERS_MANIFEST', () => {
  const ids = LIMINAL_LAYERS_MANIFEST.map((layer) => layer.id);
  const idSet = new Set(ids);

  it('contains L0 and L30 entries', () => {
    expect(idSet.has('L0')).toBe(true);
    expect(idSet.has('L30')).toBe(true);
  });

  it('ensures every layer has required fields populated', () => {
    for (const layer of LIMINAL_LAYERS_MANIFEST) {
      expect(layer.id).toBeTruthy();
      expect(layer.name.trim().length).toBeGreaterThan(0);
      expect(layer.description.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(layer.dependencies)).toBe(true);
    }
  });

  it('has no duplicate ids', () => {
    expect(idSet.size).toBe(ids.length);
  });

  it('uses only declared ids inside dependencies', () => {
    for (const layer of LIMINAL_LAYERS_MANIFEST) {
      for (const dependency of layer.dependencies) {
        expect(idSet.has(dependency)).toBe(true);
      }
    }
  });
});
