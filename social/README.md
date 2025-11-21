# Social Resonance Engine

The SocialResonanceEngine senses alignment between the organism and its field (peers, clusters, ambient pressure).
It fuses emotion, intent, interoception, perception, and meta patterns to rate self-resonance, field pressure, and peer alignment
and emits social recommendations such as **align**, **detach**, **amplify**, or **shield**.

## Signals
- Emotion snapshot
- Intent state
- Perception summary (pressure/threat/opportunity)
- Interoception summary (fatigue/tension/entropy pressure)
- Meta observations (coherence, anomalies)
- Optional peer snapshots (alignment, sync potential, tension)

## Outputs
- Self resonance score & annotations
- Field resonance (pressure, opportunity, dissonance)
- Peer alignment list with sync potential
- Recommendation with priority and target peer (when known)

## Usage
- Called every heartbeat via `systemContext`
- Observed through `/api/system/social/resonance` and `/api/system/social/peers`
- Recommendations can modulate intent/meta layers and inform reflex policies in later iterations
