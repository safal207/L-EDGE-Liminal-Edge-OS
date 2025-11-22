# Transmutation Layer

The transmutation organ separates noise from signal, mutates refined state and feeds it back into the master cycle. It listens to circulation loops, cleans entropy, tags the changes and makes the purified context available to downstream layers (sleep + edge refresh).

## Files
- `contracts.ts` — shared interfaces for transmutation metrics/state.
- `transmutationEngine.ts` — orchestrates conversions and exposes metrics.
- `converters/entropyCleaner.ts` — drops noisy events based on entropy score.
- `converters/signalSeparator.ts` — extracts signal events and calculates strength.
- `converters/stateMutator.ts` — deterministically mutates the refined state and produces tags.
- `tests/transmutationEngine.test.ts` — coverage for entropy cleaning + state mutation logic.

## Future work
- Replace heuristic cleaners with SOMA-backed entropy estimators.
- Write adapters for pushing refined packets back into LiminalBD.
- Add transmutation history stream for LRI dream visualizations.
