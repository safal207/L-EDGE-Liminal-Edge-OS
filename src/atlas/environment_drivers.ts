export interface EnvironmentalDriver {
  id: number;
  label: string;
  pressure: number; // 0..1
}

export const ENVIRONMENTAL_DRIVERS: EnvironmentalDriver[] = [
  { id: 1, label: 'Structure', pressure: 0.52 },
  { id: 2, label: 'Energy', pressure: 0.64 },
  { id: 3, label: 'Flow', pressure: 0.58 },
  { id: 4, label: 'Dynamics', pressure: 0.61 },
  { id: 5, label: 'Charge', pressure: 0.55 },
];

export const selectEnvironmentalDriver = (score: number): EnvironmentalDriver => {
  const clamped = Math.min(1, Math.max(0, score));
  const index = Math.min(
    ENVIRONMENTAL_DRIVERS.length - 1,
    Math.round(clamped * (ENVIRONMENTAL_DRIVERS.length - 1)),
  );
  return ENVIRONMENTAL_DRIVERS[index];
};
