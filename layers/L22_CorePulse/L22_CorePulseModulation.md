# L22 Core Pulse Modulation & Phase Dynamics

## Purpose
The modulation pathway refines the Core Pulse by blending drift trends with soft inputs from sense, luck, breathing, and foresight layers. It outputs phase-oriented coefficients and rhythm recommendations that let downstream layers react to stress, resonance, or uplift without destabilizing the organism tone.

## Inputs
- **CorePulseDrift**: trend from recent pulse history (`rising`, `stable`, `falling`, `irregular`).
- **PulseModulationInput** (all normalized):
  - `senseTension`: short-term contraction/tightness (0..1).
  - `senseUplift`: positive affect / uplift (0..1).
  - `luckResonance`: resonance from L21 luck/decision window (0..1).
  - `breathingCoherence`: coherence of respiration loops from L29/L33 (0..1).
  - `foresightPhase`: signed phase guidance from L31-L34 (-1..1).

## Outputs
- **PulseModulationState**
  - `modulationLevel` (0..1): net modulation intensity after drift + inputs.
  - `phaseCoefficient` (-1..1): steering coefficient for contraction (-) vs expansion (+).
  - `stabilized`: whether modulation is sufficiently contained (coherent breathing, non-irregular drift, moderate level).
  - `recommendedRhythm`: `slow | neutral | fast` suggestion for pacing other layers.

## Process & Heuristics
1. **Drift baseline**: derive a base modulation (centered at 0.5) adjusted by drift (+0.1 rising, -0.1 falling, -0.15 irregular).
2. **Input blending**:
   - uplift and luck raise modulation; tension lowers it.
   - breathing slightly raises modulation but primarily contributes to stabilization.
   - foresight and luck bias the `phaseCoefficient`; tension counters it.
3. **Stabilization**: marked true when breathing coherence is mid-high, drift is not irregular, and modulation remains below overload-ish ranges.
4. **Rhythm mapping**: low modulation → `slow`, mid → `neutral`, high → `fast`.

## Integration Notes
- Lives inside `layers/L22_CorePulse/`; it is pure and side-effect free.
- Exposed through `src/layers/L22_core_pulse/index.ts` for future orchestration.
- Downstream layers (L24 decision engines, L29 respiration rhythm, L35 resonance) can treat `phaseCoefficient` as a gentle weight, not a hard directive.
- Modulation must never emit `NaN`/`undefined`; all outputs are clamped to stated ranges.
