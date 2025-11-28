export type PathDynamics = 'linear' | 'nonlinear' | 'chaotic' | 'adaptive';

export interface PathType {
  id: number;
  label: string;
  dynamics: PathDynamics;
}

const dynamicsByIndex: PathDynamics[] = ['linear', 'nonlinear', 'chaotic', 'adaptive'];

export const PATH_TYPES: PathType[] = Array.from({ length: 32 }, (_, index) => {
  const id = index + 1;
  const dynamics = dynamicsByIndex[index % dynamicsByIndex.length];
  return {
    id,
    label: `Path-${id.toString().padStart(2, '0')}`,
    dynamics,
  };
});

export const selectPathByScore = (score: number): PathType => {
  const clamped = Math.min(1, Math.max(0, score));
  const index = Math.min(PATH_TYPES.length - 1, Math.round(clamped * (PATH_TYPES.length - 1)));
  return PATH_TYPES[index];
};
