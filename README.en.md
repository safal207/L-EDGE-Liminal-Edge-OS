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
