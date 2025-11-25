export type MicroStressType = 'thermal' | 'cognitive' | 'network' | 'memory';

export interface MicroStress {
  type: MicroStressType;
  intensity: number; // 0.0–1.0
  duration: number; // milliseconds
}

export type AdaptationSignal =
  | 'NO_ADAPTATION'
  | 'MICRO_RESILIENCE'
  | 'STRUCTURAL_GROWTH'
  | 'OVERLOAD_RISK';

export class HormesisEngine {
  constructor(private callback: (signal: AdaptationSignal, stress: MicroStress) => void) {}

  applyStress(stress: MicroStress): void {
    const normalizedStress = this.normalizeStress(stress);
    const adaptation = this.computeAdaptation(normalizedStress);
    this.callback(adaptation, normalizedStress);
  }

  private normalizeStress(stress: MicroStress): MicroStress {
    const intensity = Math.min(Math.max(stress.intensity, 0), 1);
    const duration = Math.max(stress.duration, 0);
    return { ...stress, intensity, duration };
  }

  private computeAdaptation(stress: MicroStress): AdaptationSignal {
    if (stress.intensity < 0.15) return 'NO_ADAPTATION';
    if (stress.intensity < 0.35) return 'MICRO_RESILIENCE';
    if (stress.intensity < 0.55) return 'STRUCTURAL_GROWTH';
    return 'OVERLOAD_RISK';
  }
}
