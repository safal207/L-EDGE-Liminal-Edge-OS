# L22 — Core Pulse Layer

L22 is the **Core Pulse** layer. It keeps a steady internal rhythm between **L21 Flow Alignment / luck calibration** and **L23 Informational Fluid** so the organism has a reliable tone to time decisions, integrate signals, and avoid overload. Core Pulse exposes a central pulse signal that other layers can read to gauge readiness, fatigue, and phase coherence.

---

## 1) Purpose & Position in the Stack
- Acts as the **bridge between alignment (L21) and information liquidity (L23)** by providing a neutral, normalized pulse reference.
- Gives downstream layers (L24–L25 decisions/vision, L30–L35 higher cognition) a **heartbeat-like cadence** to synchronize updates.
- Keeps the system within a **safe energetic band**: enough activation for responsiveness, not so much that L23 destabilizes or L33 breathing has to compensate.

---

## 2) Inputs & Signals
- **Flow-alignment signals (L21):** luck intensity, trajectory pressure, decision readiness hints.
- **Informational fluid feedback (L23):** phase stability, imprint volatility, regional coherence changes.
- **Breathing layer (L33) / organism tone:** respiration tempo, depth, and parasympathetic vs sympathetic balance.
- **Emotional/interoceptive tone:** coarse affect or somatic stress indicators.
- **Historical pulses (short window):** recent CorePulseState snapshots to compute variability and phase transitions.

---

## 3) Outputs
- **CorePulseState** (primary export):
  - `baseline`: normalized resting tone (intensity + stability).
  - `current`: instantaneous core pulse signal (intensity, variability, phase, overload risk).
  - `modulation`: how breathing, luck/flow, and emotional tone adjust the pulse.
  - `readiness`: 0..1 readiness for new commitments/decisions (used by L24/L25).
  - `overloadLevel`: perceived overload risk that upstream layers (e.g., L28/L29) can drain.
  - `drift`: optional qualitative drift tag (`rising` | `stable` | `falling` | `irregular`) derived from recent history.
- **Readiness/overload hints:** simple flags or thresholds derived from `CorePulseState` (e.g., “cooldown”, “ready to surge”).
- **Phase tags:** qualitative descriptors (`rest`, `rise`, `peak`, `recovery`) for synchronization with L23/L33 rhythms.

---

## 4) Invariants & Safety
- Always maintain a **valid baseline**: `intensity` and `stability` are clamped to 0..1; no NaN/undefined propagation.
- `CorePulseState` must be **pure and deterministic** for the same inputs (no side effects or hidden timers in this layer’s core API).
- Pulse variability should be tracked over a **short window** to avoid runaway oscillations.
- Overload risk estimation must never exceed the normalized bounds and should default to a **low, non-zero floor** to keep L28/L29 vigilant.

---

## 5) Interactions (Conceptual)
- **L21 (luck / flow alignment):** provides activation surges and trajectory pressure; Core Pulse smooths them into rhythmic modulation instead of spikes.
- **L23 (informational fluid):** consumes pulse phase to decide how quickly to crystallize or stay fluid; returns volatility signals that adjust variability.
- **L29 (respiration rhythm):** can throttle or release overload via breath-paced damping; Core Pulse mirrors the breathing tempo for coherence.
- **L33 (breathing):** supplies breathing influence directly (slow = rest, fast = rise/peak); Core Pulse echoes the respiratory wave.
- **L35 (fuzzy resonance):** uses the stable pulse to align resonance patterns; Core Pulse receives resonance jitter as variability feedback.

---

## 6) Future Work / Integration Notes
- Implement a **Core Pulse engine** in `src/layers/L22_core_pulse` that updates `CorePulseState` from live signals.
- Wire `CorePulseState` into **organism tone** so other layers can consume a unified pulse reference.
- Add **interfaces for cooldown/surge gating** in L24/L25 decision flows based on `readiness` and `overloadLevel` thresholds.
- Integrate with **breathing (L33) and respiration rhythm (L29)** for bidirectional modulation.
- Add **observability hooks**: small traces or events emitting pulse phase transitions for diagnostics without coupling to runtime logic.
