# L22 — Core Pulse Layer

L22 Core Pulse is the organism's heartbeat. It tracks the core rhythm, detects drift (rising / falling / irregular / stable), computes modulation and overload, and emits a normalized `CorePulseState` plus snapshots for upstream consumers.

---

## Purpose
- Maintain a steady internal rhythm between alignment (L21) and informational fluidity (L23).
- Offer downstream layers a consistent heartbeat to time decisions, integrate signals, and avoid overload.
- Provide safe, normalized pulse data other organs can read for readiness, fatigue, and phase coherence.

## Inputs
- Pulse history window (recent `CorePulseState` samples) for variability and drift detection.
- Modulation inputs: breathing/respiration influence, flow alignment signals, emotional tone, resonance jitter.
- Context: organism tone fields needed to compute overload and readiness.

## Outputs
- **`CorePulseState`**: normalized baseline + current pulse with modulation, overload level, readiness, and drift tag.
- **`CorePulseSnapshot`**: structured snapshot for logging/observers aligned with the state.
- Readiness/overload hints and phase tags derived from the state for quick gating.

## Invariants
- Pure and deterministic for the same inputs; no hidden timers or global state.
- Safe defaults: clamp intensity/stability to 0..1 and keep a low, non-zero overload floor.
- Snapshot generation must not mutate shared state; history is passed in, not stored globally.

## Integration notes
- L22 is wired into **organism tone** so other layers can consume a unified pulse reference and optionally carry `corePulse` in their context.
- Downstream consumers (decision, emotion, sense) can bias their readiness or damping based on `CorePulseSnapshot` without owning pulse logic.
- Upstream regulators (breathing, resonance, flow alignment) modulate L22 via explicit inputs; no implicit coupling.

### How it fits in
- **L21 luck**, **L22 core rhythm**, and **L24 decision wave engine** form a micro-axis for flow and choice: luck nudges, core pulse normalizes rhythm, decision waves commit energy at stable phases.
