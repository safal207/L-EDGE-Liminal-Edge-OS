import { applyLuckCalibration, getLuckCalibrationBias, resetLuckCalibration } from "../L32_retrospective";

/**
 * Lightweight bridge that exposes luck calibration state for demos and tooling.
 */
export function getLuckBias(): number {
  return getLuckCalibrationBias();
}

export { applyLuckCalibration, getLuckCalibrationBias, resetLuckCalibration };
