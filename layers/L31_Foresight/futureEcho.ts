export interface FutureEcho {
  echoSignal: number;
  intensity: number;
}

export function generateFutureEcho(direction: number, confidence: number): FutureEcho {
  const echoSignal = direction * (0.2 + confidence * 0.8);
  return {
    echoSignal,
    intensity: Math.abs(echoSignal),
  };
}
