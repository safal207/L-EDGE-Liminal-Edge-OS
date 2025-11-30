export type ContextSource = "external" | "system" | "user" | "environment" | "network";
export type ContextType = "event" | "metric" | "state" | "change";

export interface ContextSignal {
  source: ContextSource;
  type: ContextType;
  payload: Record<string, unknown>;
  timestamp: number;
  confidence: number; // 0..1
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const normalizePayload = (
  payload: Record<string, unknown> | undefined
): Record<string, unknown> => {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  return { ...payload };
};

const normalizeSource = (source?: string): ContextSource => {
  if (source === "system" || source === "user" || source === "environment") {
    return source;
  }
  if (source === "network") {
    return "network";
  }
  return "external";
};

const normalizeType = (type?: string): ContextType => {
  if (type === "metric" || type === "state" || type === "change") {
    return type;
  }
  return "event";
};

/**
 * Normalize a raw signal into a ContextSignal contract.
 */
export const processSignal = (
  signal: Partial<ContextSignal>
): ContextSignal => {
  const payload = normalizePayload(signal.payload);
  const confidence = clamp01(signal.confidence ?? 0.5);

  return {
    source: normalizeSource(signal.source),
    type: normalizeType(signal.type),
    payload,
    timestamp: signal.timestamp ?? Date.now(),
    confidence,
  };
};
