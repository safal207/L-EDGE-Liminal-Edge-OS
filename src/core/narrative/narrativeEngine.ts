import type { LiminalAxesPosition, LiminalEvent } from "../meta/metaObserver";
import type {
  NarrativeSpan,
  NarrativeSummary,
  NarrativeSignalSummary,
  NarrativeTone,
} from "./narrativeTypes";

function computeSpan(events: LiminalEvent[]): NarrativeSpan {
  if (events.length === 0) {
    const now = new Date().toISOString();
    return { from: now, to: now };
  }

  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  return {
    from: sorted[0].timestamp,
    to: sorted[sorted.length - 1].timestamp,
  };
}

function averageAxes(events: LiminalEvent[]): LiminalAxesPosition | undefined {
  const axesEvents = events.filter((event) => event.axes);
  if (axesEvents.length === 0) return undefined;

  const sum = axesEvents.reduce(
    (acc, event) => {
      acc.self += event.axes!.self;
      acc.social += event.axes!.social;
      acc.cosmic += event.axes!.cosmic;
      return acc;
    },
    { self: 0, social: 0, cosmic: 0 },
  );

  const count = axesEvents.length;
  return {
    self: sum.self / count,
    social: sum.social / count,
    cosmic: sum.cosmic / count,
  };
}

function inferTone(signals: NarrativeSignalSummary): NarrativeTone {
  const trends = signals.trends ?? {};
  const values = Object.values(trends);
  const ups = values.filter((value) => value === "up").length;
  const downs = values.filter((value) => value === "down").length;

  if (downs > ups && downs > 0) return "alert";
  if (ups > downs && ups > 0) return "optimistic";
  if (ups === 0 && downs === 0) return "neutral";
  return "neutral";
}

function computeTrends(_events: LiminalEvent[]): NarrativeSignalSummary["trends"] {
  return {};
}

function buildDefaultSummaryText(
  span: NarrativeSpan,
  axes?: LiminalAxesPosition,
  tone: NarrativeTone = "neutral",
): string {
  if (!axes) {
    return `За период с ${span.from} по ${span.to} данных достаточно только для общей фиксации состояния (тон: ${tone}).`;
  }

  const { self, social, cosmic } = axes;
  return [
    `За период с ${span.from} по ${span.to} организм проявлял`,
    `личное состояние ~${self.toFixed(2)},`,
    `социальную вовлечённость ~${social.toFixed(2)},`,
    `космическую направленность ~${cosmic.toFixed(2)}.`,
    `Общий тон: ${tone}.`,
  ].join(" ");
}

export function generateNarrativeSummary(
  events: LiminalEvent[],
  opts?: { includeSource?: boolean },
): NarrativeSummary {
  const span = computeSpan(events);
  const avgAxes = averageAxes(events);
  const trends = computeTrends(events);

  const signals: NarrativeSignalSummary = {
    avgAxes,
    trends,
    dominantLayers: undefined,
  };

  const tone = inferTone(signals);
  const summaryText = buildDefaultSummaryText(span, avgAxes, tone);

  return {
    span,
    tone,
    summary: summaryText,
    signals,
    sourceEvents: opts?.includeSource ? events : undefined,
  };
}
