import { runOrganismPipeline } from '@/core/organismPipeline';
import type { TriAxisState } from '@/core/types/ontogenesis';
import { renderOrganismSnapshot } from '@/debug/renderOrganismSnapshot';

const triAxis: TriAxisState = {
  L: { id: 'L', value: 0.58, nourishment: 0.65, pressure: 0.32 },
  S: { id: 'S', value: 0.52, nourishment: 0.55, pressure: 0.38 },
  C: { id: 'C', value: 0.46, nourishment: 0.6, pressure: 0.28 },
};

const snapshot = runOrganismPipeline({
  triAxis,
  stage: 10,
  loadIndex: 0.42,
  resonanceQuality: 0.63,
  recentRecoveryIndex: 0.58,
});

renderOrganismSnapshot(snapshot);
