import { describe, expect, it } from 'vitest';
import {
  getDependencies,
  getLayer,
  LAYERS_BY_ID,
  LIMINAL_LAYERS_MANIFEST,
} from '../core/layers.manifest';

describe('LIMINAL_LAYERS_MANIFEST', () => {
  const ids = LIMINAL_LAYERS_MANIFEST.map((layer) => layer.id);
  const idSet = new Set(ids);

  it('contains L0 and L31 entries', () => {
    expect(idSet.has('L0')).toBe(true);
    expect(idSet.has('L31')).toBe(true);
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

  it('exposes a lookup map keyed by id', () => {
    expect(LAYERS_BY_ID.get('L0')).toBe(LIMINAL_LAYERS_MANIFEST[0]);
    expect(LAYERS_BY_ID.has('L30')).toBe(true);
    expect(LAYERS_BY_ID.size).toBe(LIMINAL_LAYERS_MANIFEST.length);
  });

  it('returns undefined for unknown ids', () => {
    expect(LAYERS_BY_ID.get('L999')).toBeUndefined();
  });

  it('provides lookup helpers for layers and dependencies', () => {
    expect(getLayer('L0')).toEqual(LIMINAL_LAYERS_MANIFEST[0]);
    expect(getLayer('L999')).toBeUndefined();

    const dependencies = getDependencies('L13');
    const expected = ['L9', 'L10', 'L11', 'L12'];

    expect(dependencies.map((layer) => layer.id)).toEqual(expected);
    expect(getDependencies('L999')).toEqual([]);
  });
});
