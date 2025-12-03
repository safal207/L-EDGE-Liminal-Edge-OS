export interface DaySummary {
  date: string;
  learningSignal?: number; // 0..1 how strong the learning momentum was
  successRate?: number; // 0..1 recent win rate / progress marker
  overloadIndex?: number; // 0..1 how close the system was to overload
  notes?: string;
}
