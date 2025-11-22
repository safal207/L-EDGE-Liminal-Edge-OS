# FuzzyEvolutionNode — Assembly Point #13

The fuzzy evolution layer replaces hard thresholds with a soft, string-like view of the organism. It watches Meta-Orchestrator, Origin, and Pathway signals, builds fuzzy pressure bands (low/medium/high), and names the system’s current vibration mode (ground, resonant, chaotic, damped).

## Signals and outputs
- **Pressure:** fuzzy tension/coherence/alignment membership values.
- **Strings:** a `globalMode` and short comment about how the organism vibrates.
- **Suggestions:** gentle hints to soften chaos, re-energize damped cycles, or keep resonance stable.

## Lifecycle placement
Updated each heartbeat after Origin and Pathway. Exposed through `/api/system/evolution/fuzzy`, included in health and organism payloads so downstream observers can see the current vibration mode.

## Example response
```
{
  "timestamp": 1732301234567,
  "cyclesObserved": 144,
  "pressure": {
    "tension": { "low": 0.2, "medium": 0.6, "high": 0.3 },
    "coherence": { "low": 0.1, "medium": 0.4, "high": 0.7 },
    "alignment": { "low": 0.15, "medium": 0.5, "high": 0.4 }
  },
  "strings": {
    "globalMode": "resonant",
    "comment": "Система в режиме резонанса: напряжение управляемое, согласованность высокая."
  },
  "suggestions": [
    {
      "id": "keep_resonance",
      "message": "Поддерживайте текущий темп роста, избегая резких скачков нагрузки.",
      "severity": "soft"
    }
  ],
  "summary": "Система вибрирует в устойчивом резонансе, допустим плавный рост."
}
```
