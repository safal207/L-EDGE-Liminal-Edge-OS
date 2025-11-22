# Intent Engine / Volition Layer

The IntentEngine translates organism-wide signals (homeostasis, reflex, memory, dream replay) into a current operating mode and a set of directives for the rest of the system. It acts as a lightweight prefrontal cortex: assessing stress, recent protective responses, integration debt, and recovery progress to decide whether the organism should push, conserve, or heal.

Key ideas:
- Derive `IntentMode` such as **CALM**, **FOCUSED**, **HEALING**, **DEGRADED**, and **CRITICAL** from combined stress and relief signals.
- Emit `IntentDecision` flags (`allowHeavyTasks`, `throttleNonCritical`, `forceSleepSoon`, `preferCache`, `degradedMode`, `boostTransmutation`) to steer runtime/edge behavior.
- Support developer overrides for experiments and expose state via `/api/system/intent`.

Typical flow:
1. Heartbeat gathers homeostasis/reflex/replay/memory snapshots.
2. IntentEngine evaluates and stores the new mode/decision set.
3. Runtime can simulate throttling or energy-saving based on the decision.
4. Interfaces publish the current intent in health payloads and dedicated endpoints.
