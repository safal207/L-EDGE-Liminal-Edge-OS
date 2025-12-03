export function gentleSteer(current: number, echo: number): number {
  const adjustment = echo * 0.4;
  return current + adjustment;
}
