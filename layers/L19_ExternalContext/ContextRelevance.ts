import { ContextSignal } from "./ContextSignal";

export interface ContextRelevance {
  relevance: number; // 0..1
  reason: string;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const detectReason = (signal: ContextSignal): string => {
  const payload = signal.payload;
  if (typeof payload.cpu_usage === "number" && payload.cpu_usage > 0.75) {
    return "cpu_load_high";
  }
  if (typeof payload.alert === "string") {
    return payload.alert;
  }
  if (payload.goal) {
    return "goal_related";
  }
  if (payload.event) {
    return "event_signal";
  }
  return `${signal.source}_${signal.type}`;
};

export const evaluateRelevance = (signal: ContextSignal): ContextRelevance => {
  const baseFromConfidence = 0.3 + 0.5 * signal.confidence;
  let relevance = clamp01(baseFromConfidence);
  const payload = signal.payload;

  if (typeof payload.cpu_usage === "number") {
    const load = clamp01(payload.cpu_usage);
    relevance = Math.max(relevance, load);
  }

  if (typeof payload.critical === "boolean" && payload.critical) {
    relevance = Math.max(relevance, 0.85);
  }

  const reason = detectReason(signal);

  return {
    relevance: clamp01(relevance),
    reason,
  };
};
