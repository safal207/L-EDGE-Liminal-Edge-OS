# Foresight → Outcome → Retrospective loop

```
Decision
  ↓
Foresight (L31)
  ↓
RealizedOutcome (core)
  ↓
Retrospective (L32)
  ↓
Calibration (L21/L31) + Meta-Insights (L30)
```

## How to run the demo

```
pnpm install
pnpm dev:retro
```

## Example snapshot output

```
=== Running foresight → outcome → retrospective demo ===
well_calibrated_win     :: foresight=1.00 success=0.92 match=well_calibrated
confident_miss          :: foresight=0.82 success=0.25 match=overconfident
cautious_but_successful :: foresight=0.30 success=0.90 match=underconfident
ambivalent_guess        :: foresight=0.34 success=0.55 match=missed
=== L-EDGE RETRO SNAPSHOT ===
confidenceScale: 1.000
luckBias: 0.000
1764748320734 d=demo_decision_3 match=underconfident conf=0.30 success=0.90 surprise=0.45 learn=0.40
```
