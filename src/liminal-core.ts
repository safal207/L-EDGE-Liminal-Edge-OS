import {
  LIMINAL_LAYERS_MANIFEST,
  LiminalLayerManifest,
  LiminalLayerSpec,
} from '../core/layers.manifest';

export type { LiminalLayerManifest, LiminalLayerSpec };

export type OrganismNoisePayload = {
  missing?: string[];
  corrupt?: boolean;
};

function cloneManifest(manifest: LiminalLayerManifest): LiminalLayerManifest {
  return manifest.map((layer) => ({
    ...layer,
    dependencies: [...layer.dependencies],
  }));
}

let workingManifest: LiminalLayerManifest = cloneManifest(LIMINAL_LAYERS_MANIFEST);
let workingMap: Map<string, LiminalLayerSpec> = new Map(
  workingManifest.map((layer) => [layer.id, layer]),
);

function setWorkingState(manifest: LiminalLayerManifest): void {
  workingManifest = cloneManifest(manifest);
  workingMap = new Map(workingManifest.map((layer) => [layer.id, layer]));
}

export function listLayers(): LiminalLayerManifest {
  return cloneManifest(workingManifest);
}

export function getLayer(id: string): LiminalLayerSpec | undefined {
  return workingMap.get(id);
}

export function getDependencies(id: string): LiminalLayerSpec[] {
  const layer = workingMap.get(id);

  if (!layer) {
    return [];
  }

  return layer.dependencies
    .map((dependencyId) => workingMap.get(dependencyId))
    .filter((dependency): dependency is LiminalLayerSpec => Boolean(dependency));
}

function refreshHomeostasis(): void {
  setWorkingState(LIMINAL_LAYERS_MANIFEST);
}

function rebuildStructure(): void {
  setWorkingState(LIMINAL_LAYERS_MANIFEST);
}

function injectNoise(payload?: OrganismNoisePayload): void {
  const missingSet = new Set(payload?.missing ?? []);
  const shouldCorrupt = payload?.corrupt ?? false;

  const degraded = workingManifest
    .filter((layer) => !missingSet.has(layer.id))
    .map((layer) => ({
      ...layer,
      dependencies: shouldCorrupt
        ? layer.dependencies.filter((dependency) => typeof dependency === 'string')
        : [...layer.dependencies],
    }));

  setWorkingState(degraded);
}

export const organism = {
  refreshHomeostasis,
  rebuildStructure,
  injectNoise,
};
