export type LiminalLayerId =
  | "L0_CORE"
  | "L1_AXES"
  | "L2_POINT_OF_ASSEMBLAGE"
  | "L3_SYSTEM_FORCES"
  | "L4_DAO"
  | "L5_ORIENTATION_CENTER"
  | "L6_BALANCE"
  | "L7_DEPTH"
  | "L8_EMERGENCE"
  | "L9_STABILITY"
  | "L10_PHASE"
  | "L11_IN_YANG"
  | "L12_TAO"
  | "L13_PREDICTION"
  | "L14_FUZZY_LOGIC"
  | "L15_RESILIENCE"
  | "L16_METASTABILITY"
  | "L17_OBSERVER"
  | "L18_TIME_WEAVER"
  | "L19_DECISION_FIELD"
  | "L20_WILL"
  | "L21_FLOW_ALIGNMENT";

export interface LiminalAxesPosition {
  self: number; // 0..1
  social: number; // 0..1
  cosmic: number; // 0..1
}

export interface LiminalEvent {
  id: string;
  timestamp: string; // ISO
  layer: LiminalLayerId;

  // Краткое описание того, что произошло
  label: string;

  // Проекция на три оси (если применимо)
  axes?: LiminalAxesPosition;

  // Числовые метрики слоя (произвольный словарь)
  metrics?: Record<string, number>;

  // Произвольные метаданные (для UI, логов и т.д.)
  context?: Record<string, unknown>;
}

export interface MetaObserver {
  record(event: LiminalEvent): void;

  recordMany?(events: LiminalEvent[]): void;

  flush?(): void;
}
