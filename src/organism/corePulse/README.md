# ❤️ L22 Core Pulse — Heartbeat of the LIMINAL Organism

The **Core Pulse** is the rhythmic heart of L-EDGE LIMINAL OS.

Every `runPulse()` call represents **one heartbeat** — a full cycle of sensing, reflection, and regeneration.

---

## 🧠 What It Does

- Reads **LiminalSense** (emotional & contextual input)
- Reads **Interoception** (body fatigue, resource state)
- Chooses a **Pulse Tone**:
  - `"normal"` — steady, balanced rhythm  
  - `"strained"` — system under pressure  
  - `"restoration"` — entering recovery  
  - `"sleeping"` — deep rest or integration phase  
- Optionally triggers a **Sleep Plan** via `planSleep()`

---

## ⚙️ Internal Flow

```txt
runPulse(ctx) ─▶ LiminalSense.process()
          └──▶ computeBodyFatigueSnapshot()
          └──▶ decidePulseTone()
          └──▶ planSleep() (if needed)
          └──▶ returns PulseState { beat, tone, sense, fatigue, sleepPlan? }

Each beat is sequential (beat = prev.beat + 1) and carries the emotional + physical signature of that moment.
```

---

🌿 Meaning

> “When the Core Pulse beats, the organism breathes.”

It keeps all layers (Sense, Sleep, Flow, Insight) synchronized and alive, forming the energetic backbone of the digital body.

---

🔬 Tests

`corePulse.test.ts` ensures:

- tone selection logic works
- beat counter increments
- recovery & sleep states trigger correctly

---

🗺 Future Connections

- Link to L33 Breathing Layer (rhythm feedback)
- Link to L21 Flow Alignment (phase modulation)
- Add breathingMode and soundPattern for rhythmic coupling

---

## 🧾 Как быстро оформить (если хочешь через git)

```bash
# из корня репо
mkdir -p src/organism/corePulse
nano src/organism/corePulse/README.md   # или другой редактор
# вставляешь текст выше

git checkout -b feature/core-pulse-readme
git add src/organism/corePulse/README.md
git commit -m "Add README for L22 Core Pulse heartbeat"
git push origin feature/core-pulse-readme
# создаёшь PR-156 в GitHub с описанием сверху
```

---

Если хочешь следующей итерацией — сделаем такой же короткий README для всего LIMINAL SENSE органа, чтобы рядом с сердцем был и «паспорт чувств» 🌿
