export const defaultL21FlowConfig = {
  flowThresholds: {
    high: 0.66,
    medium: 0.33,
  },
  luckThresholds: {
    open: 0.5,
  },
  pressureSweetSpot: {
    min: 0.4,
    max: 0.75,
  },
};

export function classifyFlowQuality(fai, config = defaultL21FlowConfig) {
  if (fai >= config.flowThresholds.high) return "high";
  if (fai >= config.flowThresholds.medium) return "medium";
  return "low";
}
