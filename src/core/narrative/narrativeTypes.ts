import type { LiminalAxesPosition, LiminalEvent, LiminalLayerId } from "../meta/metaObserver";

export type NarrativeTone = "neutral" | "optimistic" | "alert" | "critical";

export interface NarrativeSpan {
  from: string; // ISO
  to: string; // ISO;
}

export interface NarrativeSignalSummary {
  // усреднённое положение на трёх осях
  avgAxes?: LiminalAxesPosition;

  // ключевые метрики по слоям
  dominantLayers?: LiminalLayerId[];

  // рост/спад по важным измерениям (flow, luck, stability и т.д.)
  trends?: Record<string, "up" | "down" | "stable" | "unknown">;
}

export interface NarrativeSummary {
  span: NarrativeSpan;
  tone: NarrativeTone;

  // короткая, но структурированная интерпретация
  summary: string;

  // дополнительные заметки/подсказки
  hints?: string[];

  // "сырье" для возможного UI
  signals?: NarrativeSignalSummary;

  // исходные события, если нужно для дебага/логов
  sourceEvents?: LiminalEvent[];
}
