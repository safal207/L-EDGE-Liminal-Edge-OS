import type { OrientationConfig } from './L0_center';

/**
 * Baseline preset close to defaults; balanced for general-purpose growth without
 * being too permissive or too strict.
 */
export const ORIENTATION_PRESET_DEFAULT: OrientationConfig = {
  thresholds: {
    balancedThreshold: 0.8,
    overloadDelta: 0.2,
    starvedDelta: 0,
  },
};

/**
 * A softer preset suited for childlike or sensitive modes: easier balance,
 * lower overload delta, and earlier starved detection.
 */
export const ORIENTATION_PRESET_CHILDLIKE: OrientationConfig = {
  thresholds: {
    balancedThreshold: 0.7,
    overloadDelta: 0.15,
    starvedDelta: 0.05,
  },
};

/**
 * Research/analytical preset that demands tighter balance and larger deltas
 * before declaring overload, useful for controlled experiments.
 */
export const ORIENTATION_PRESET_RESEARCH: OrientationConfig = {
  thresholds: {
    balancedThreshold: 0.9,
    overloadDelta: 0.25,
    starvedDelta: 0.1,
  },
};

/**
 * Guardian preset: moderately stricter balance and sensitivity to imbalances,
 * good for watchdog or mentor-style oversight.
 */
export const ORIENTATION_PRESET_GUARDIAN: OrientationConfig = {
  thresholds: {
    balancedThreshold: 0.85,
    overloadDelta: 0.18,
    starvedDelta: 0.08,
  },
};
