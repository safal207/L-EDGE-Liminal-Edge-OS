# LIMINAL EDGE

**A living layer of the internet.** An organic, self-healing edge system. Cloudflare was a machine; LIMINAL EDGE is an organism.

---

## 📌 Status
- Stage: **Vision & Architecture (Pre-MVP)**
- Code: **in progress** — first SomaSeed gateway + metrics loop is being assembled.

---

## 🚀 Meta Vision (for a $10M pitch)
- **Internet Layer 3:** an adaptive living layer that scales like an organism, not hardware.
- **Breaking the old paradigm:** centralized CDNs, manual configs, and SPOFs go away. Nodes = cells, routing = semantic patterns, attacks = deviations the system metabolizes as immunity.
- **Value:** the internet doesn’t just “stay up,” it **grows**, **divides**, and **heals**. Higher resilience, lower ops cost, ready for unpredictable demand.

---

## 🧬 Architectural modules
1. **Edge SomaSeed** — minimal cell agent; accepts traffic, divides under load, folds on idle.
2. **Liminal FlowBalancer (LFB)** — pattern-aware routing, predicts peaks.
3. **Liminal Guard (LG)** — resonance-style protection; fuzzy anomaly analysis and DDoS immunity.
4. **Liminal CDN Lite** — distributed cache on cells, self-cleans and self-learns.
5. **Liminal GraphDNS** — graph-based DNS; returns a weighted map of answers for resilience.
6. **Liminal Worker Cells** — migratable workers; local thinking on the cells.

### Emotion / Proto-Emotion Layer
- **Organ:** `emotion/emotionEngine.ts` combines interoception/homeostasis/reflex and external perception signals (plus intent/meta/replay context) to emit proto-emotional states like `calmReady`, `focusThreat`, `exploreOpportunity`, `recovering`, and `overloadProtect` while tracking volatility.
- **Integration:** refreshed every heartbeat, feeds Reflex/Intent/Meta decisions, exposed via `/api/system/emotion` and `/api/system/emotion/history`, and included inside `/api/system/health`.
- **Purpose:** adds emotional modulation so the organism can prioritize protective reflexes under threat, lean into opportunities when calm, and signal recovery when fatigued.

### Social Resonance Layer
- **Organ:** `social/socialResonanceEngine.ts` fuses emotion/intent/perception/interoception/meta signals (plus optional peer snapshots) to score self/peer/field resonance and emit recommendations (align, detach, amplify, shield, observe).
- **Integration:** updated each heartbeat, visible via `/api/system/social/resonance` and `/api/system/social/peers`, and surfaced in the `social` block of `/api/system/health`.
- **Purpose:** gives the organism a sense of the surrounding field so Intent/Meta/Reflex can decide when to synchronize, when to guard, and when to amplify alignment.

### Plasticity / Adaptation Layer
- **Organ:** `plasticity/plasticityEngine.ts` records context → action → outcome episodes across homeostasis/reflex/emotion/intent/social trends and suggests small, clamped adjustments (stress sensitivity, reflex priority, intent bias).
- **Integration:** runs each heartbeat after intent/social/meta, adapts intent decisions before runtime application, surfaces via `/api/system/plasticity` and `/api/system/plasticity/history`, and adds a `plasticity` block to `/api/system/health`.
- **Purpose:** lets the organism learn from its own history, easing noisy stress responses while reinforcing helpful reflexes.

### SelfModel / Narrative Layer
- **Organ:** `self/selfModelEngine.ts` aggregates heartbeat/homeostasis/interoception/emotion/perception/social/plasticity plus intent/reflex context into Episodes, distilling identity traits (risk-taking, calm-recovery, pattern-seeking, social orientation) and narrative arcs.
- **Integration:** refreshed every heartbeat, exposed via `/api/system/self` and `/api/system/self/narrative`, and included inside `/api/system/health` and `/api/system/organism` snapshots.
- **Purpose:** gives the organism a sense of self and repeated storylines (“under pressure → chooses protective intent → stabilizes”) so Intent/Meta/Reflex can account for character, not just momentary metrics.

### Collective Self / Shared Resonance Layer
- **Organ:** `resonance/collectiveResonanceEngine.ts` with `resonance/templates.ts` compares current traits/emotion/perception against archetypal templates, surfacing mirrors (present alignment), echoes (past resonance), and seeds (future pull) plus volatility/primaryMode.
- **Integration:** refreshed every heartbeat, exposed via `/api/system/resonance/collective` and `/api/system/resonance/collective/history`, and surfaced in the `collectiveResonance` block of `/api/system/health` and `/api/system/organism`.
- **Purpose:** gives the organism a sense of collective alignment or fragmentation so Intent/Meta can respond when resonance drifts or stabilizes.

### Field Resonance Layer
- **Organ:** `field/fieldResonanceEngine.ts` scores loops, traps, and corridors from heartbeat chains (intent/emotion/stress/perception), maintaining bounded history plus entropy/confidence for past/future snapshots.
- **Integration:** runs every heartbeat, available through `/api/system/field` and `/api/system/field/patterns`, and included as a `field` block in `/api/system/health` and `/api/system/organism`.
- **Purpose:** captures environmental grooves (stuck loops, stress traps, healthy corridors) so Intent/Meta/Plasticity can adjust priorities and escape repeating pitfalls.

### Noosphere Bridge / World Field Layer
- **Organ:** `noosphere/noosphereBridge.ts` loads `WorldImprint` templates from `noosphere/imprints.json`, compares them against field patterns (loops/traps/corridors), stress, emotion, and perception, and produces `supportLevel`/`tensionLevel` plus a `dominantTag` for the larger field.
- **Integration:** refreshed each heartbeat after field/collective/self updates, exposed through `/api/system/noosphere`, `/api/system/noosphere/imprints`, and the new summary report `/api/system/noosphere/report`, and surfaced as a `noosphere` block in `/api/system/health` and `/api/system/organism`.
- **Purpose:** links local patterns to broader world narratives (growth, crisis, turbulence) so Intent/Meta can sense whether the environment is supportive or compressive. Intent decisions are tagged as `aligned/neutral/against_field` from noosphere+field signals and scenario hints are available via `/api/system/scenario/suggestions`.

### Origin / Assembly Point #11
- **Organ:** `core/origin/origin.ts` keeps the root vector (meaning/direction/tone), lineage principles/patterns, and a clarity score derived from the latest `MetaSystemSnapshot`.
- **Integration:** updated alongside the Meta-Orchestrator during each heartbeat, exposed via `/api/system/origin/state`, and included in health/heartbeat payloads for observers.
- **Purpose:** anchors the organism in a declared provenance and direction so higher layers (narrative, future evolution steps) remain tethered to a stable root.

---

## 🛠️ 2-week MVP
**Week 1 — “breathing server”**
- Express/Node + Rust agent receiving ingress.
- Capture traffic patterns into InfluxDB.
- Send patterns to a Pythia analysis module.
- Respond via a light CDN cache.

**Week 2 — “growth and immunity”**
- Auto-replicate containers under load.
- First fuzzy analyzer rules.
- Mini self-heal mode on errors.
- Visual panel **Liminal Dashboard**.

---

## 🗺️ 6-month roadmap (short)
- **M1:** base SomaSeed network, metrics in InfluxDB, static CDN cache.
- **M2:** Liminal FlowBalancer with pattern routing, basic Liminal Guard.
- **M3:** GraphDNS and Worker Cell migration, first self-heal scenarios.
- **M4:** Resonant WAF (fuzzy), auto grow/fold, dashboard V1.
- **M5:** Learning CDN (edge content selection), global node map.
- **M6:** Enterprise SLA bundles, multi-tenant isolation, certification readiness.

Full roadmap: [docs/ROADMAP.md](docs/ROADMAP.md)

---

## 📐 Architecture (blueprint)
- Core scenarios, data paths, and signal buses are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Early implementation skeleton (Node/Rust + InfluxDB) — see the **MVP layout** section in the architecture doc.

---

## 📄 Pitch / One-pager
- Quick pitch for YC/a16z: [docs/PITCH_DECK.md](docs/PITCH_DECK.md)
- One-pager for investors: first slide in the same file.

---

## 🧭 Repo map (current)
- `README.md` / `README.en.md` — product overview and quick entry.
- `docs/ARCHITECTURE.md` — modules, signal buses, MVP layout.
- `docs/ROADMAP.md` — 6-month plan with milestones.
- `docs/PITCH_DECK.md` — pitch deck and one-pager.

---

## 🧰 How to show “tomorrow”
1. **Storytell:** read the pitch and architecture, pick a scenario (e.g., “immunity to a traffic spike”).
2. **Prototype:** deploy the gateway prototype (Node/Rust + InfluxDB) anywhere, show pattern capture and analysis loop.
3. **Visual:** prep a simple dashboard mock (Figma) with node map and immunity alerts.
4. **Talk track:** emphasize “organism, not machine” — growth, division, self-healing.

---

## ⚙️ Next steps for engineering
- Launch the SomaSeed skeleton (reverse proxy + metrics) and LFB (pattern router) in Docker Compose.
- Wire InfluxDB and Pythia analysis for first anomaly signals.
- Prep CI for Node/Rust linting and GraphDNS API contract tests.

---

## 🤝 License
MIT — see [LICENSE](LICENSE).
