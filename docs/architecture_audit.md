# Architecture Audit (L-EDGE-Liminal-Edge-OS)

## 1. Architecture map
- **Heart/loop**: `core/systemContext.ts` orchestrates heartbeat wiring, initializes classic engines (perception, memory, intent, noosphere, etc.) and the newer organism stack (orientation L0, L6–L8, ontogenesis timeline).【F:core/systemContext.ts†L1-L120】【F:core/systemContext.ts†L430-L476】
- **Ontogenesis stack (L0–L8)**: Layer calculators live under `src/organism/…` (orientation, resonance, flow, crystal observer) with timelines and vectors described in `src/organism/ontogenesis3d.ts`.【F:src/organism/ontogenesis3d.ts†L1-L120】【F:core/systemContext.ts†L44-L103】
- **Shared typing**: New baseline axis/polarity/vector types live in `src/core/types/ontogenesis.ts`; they currently coexist with richer per-layer vectors in `ontogenesis3d.ts`.【F:src/core/types/ontogenesis.ts†L1-L34】【F:src/organism/ontogenesis3d.ts†L60-L119】
- **Configuration**: `tsconfig.json` now exposes an `@/` alias to `src/*` for cross-layer imports; older subsystems remain under top-level folders with relative imports.【F:tsconfig.json†L13-L16】【F:core/systemContext.ts†L1-L40】
- **Docs**: Each ontogenesis stage has a dedicated guide; L8 example in `docs/ontogenesis_L8_crystal_observer.md` shows signals, config, and integration expectations.【F:docs/ontogenesis_L8_crystal_observer.md†L1-L50】

## 2. Strong sides
- **Centralized heartbeat + timeline**: `systemContext` seeds and updates an ontogenesis vector and rolling timeline, ensuring every heartbeat persists L0–L8 telemetry for APIs and observers.【F:core/systemContext.ts†L430-L476】【F:core/systemContext.ts†L1016-L1030】
- **Layered organism modules**: L0 (orientation), L6 (resonance), L7 (flow), and L8 (crystal) are modularized in `src/organism`, making each layer independently testable and replaceable while sharing config presets (e.g., resonance modes, cerebellum modes).【F:core/systemContext.ts†L69-L103】【F:src/organism/observer/L8_crystal_observer.ts†L1-L40】
- **Rich documentation**: Ontogenesis guides (e.g., L8) clearly describe purpose, configs, and signal semantics, which lowers onboarding cost for contributors.【F:docs/ontogenesis_L8_crystal_observer.md†L1-L50】
- **Path alias & shared types**: `@/` alias plus shared axis/polarity/vector types give a foundation for consistent imports and contracts across layers.【F:tsconfig.json†L13-L16】【F:src/core/types/ontogenesis.ts†L1-L34】

## 3. Weeds & issues
### 3.1 Structural
- **Dual ontogenesis models**: `src/core/types/ontogenesis.ts` defines a minimal `OntogenesisVector`, while `src/organism/ontogenesis3d.ts` carries a much richer and different `OntogenesisVector` shape, leading to parallel type hierarchies and potential drift.【F:src/core/types/ontogenesis.ts†L15-L34】【F:src/organism/ontogenesis3d.ts†L60-L119】 (Severity: high)
- **Mixed module roots**: `systemContext` mixes legacy engines under top-level folders (awareness, resonance, intent) with new organism layers under `@/…`, so the project feels like two overlapping architectures rather than one cohesive tree.【F:core/systemContext.ts†L1-L40】【F:core/systemContext.ts†L44-L103】 (Severity: medium)
### 3.2 Typing
- **Placeholder types**: The new shared `OntogenesisVector` still exposes `unknown` for L0–L6, so downstream modules cannot rely on a single authoritative shape; they fall back to the richer but separate `ontogenesis3d` definition.【F:src/core/types/ontogenesis.ts†L15-L30】 (Severity: medium)
- **Polarity duplication**: `src/core/types/ontogenesis.ts` declares a minimal `PolaritySnapshot`, while orientation L0 uses a fuller `PolaritySnapshot` with per-axis tau/ratio/state, creating room for mismatch when plumbing data between layers.【F:src/core/types/ontogenesis.ts†L19-L23】【F:src/organism/orientation/L0_polarity.ts†L1-L25】 (Severity: medium)
### 3.3 Imports & dependencies
- **Partial alias adoption**: Only organism-layer imports use `@/`; legacy subsystems still rely on long relative paths, keeping the dependency graph fragmented and making future moves riskier.【F:core/systemContext.ts†L1-L40】【F:tsconfig.json†L13-L16】 (Severity: medium)
### 3.4 Potential dead/overlapping code
- **Assembly-point proliferation**: `ontogenesis3d.ts` embeds assembly descriptors, social bands, and vector fields that may overlap with newer shared types, suggesting older assembly-point logic is still embedded alongside the newer L0–L8 stack without clear ownership.【F:src/organism/ontogenesis3d.ts†L21-L119】 (Severity: medium)

## 4. L0–L8 vs. old assembly point
- The current “assembly point” is expressed via `Ontogenesis3D.describeVector`, which combines the rich L0–L8 telemetry into a single vector and seeds the heartbeat timeline in `systemContext`.【F:src/organism/ontogenesis3d.ts†L60-L107】【F:core/systemContext.ts†L430-L476】 
- Age/axes/polarity now live across multiple files: assembly IDs and social bands in `ontogenesis3d.ts`, axes/polarity baselines in `src/core/types/ontogenesis.ts`, and L0–L8 layer outputs in their respective modules. This feels like an evolution of the original assembly-point idea, but the split definitions mean the “one source of truth” is blurred between legacy assembly metadata and the newer L-stack telemetry.【F:src/organism/ontogenesis3d.ts†L21-L119】【F:src/core/types/ontogenesis.ts†L1-L34】

## 5. Refactoring roadmap
- **Iteration 1 (1–3 days, low risk)**
  - Consolidate imports to the `@/` alias for cross-module references in `core/systemContext.ts` and other orchestrators so the dependency graph is uniform.【F:core/systemContext.ts†L1-L40】
  - Replace `unknown` placeholders in `src/core/types/ontogenesis.ts` with the concrete shapes already produced by L0–L6 modules, or explicitly alias to the richer `OntogenesisVector` from `ontogenesis3d.ts` to remove ambiguity.【F:src/core/types/ontogenesis.ts†L15-L34】【F:src/organism/ontogenesis3d.ts†L60-L119】

- **Iteration 2 (1–2 weeks, structural alignment)**
  - Choose a single authoritative `OntogenesisVector` definition (likely the richer `ontogenesis3d` shape), then refactor shared types and consumers to point to it; deprecate the duplicate vector in `src/core/types/ontogenesis.ts` or flatten fields into a versioned contract.【F:src/core/types/ontogenesis.ts†L15-L34】【F:src/organism/ontogenesis3d.ts†L60-L119】
  - Extract legacy subsystems (awareness/memory/resonance/etc.) into the same aliasable tree or wrap them behind well-typed interfaces to reduce cross-root coupling in `systemContext`.【F:core/systemContext.ts†L1-L40】
  - Define unified polarity/axis types (tau/ratio/state + per-axis levels) and replace the minimal polarity stub in shared types to avoid drift between L0 polarity and downstream observers.【F:src/core/types/ontogenesis.ts†L19-L23】【F:src/organism/orientation/L0_polarity.ts†L1-L25】

- **Iteration 3 (lab/advanced polish)**
  - Introduce a dedicated “ontogenesis engine” module that owns vector composition, history management, and contracts, decoupling it from `systemContext` orchestration while keeping the timeline API stable.【F:core/systemContext.ts†L430-L476】【F:core/systemContext.ts†L1016-L1030】
  - Add contract tests or fixtures per L-layer (L0–L8) to validate type compatibility across the heartbeat, especially around axis/polarity/flow/crystal shapes, ensuring refactors won’t silently break the data plane.【F:src/organism/ontogenesis3d.ts†L60-L119】
  - Gradually migrate remaining docs and code to refer to the single authoritative vector/axis/polarity types, so the living documentation matches the actual runtime contracts.【F:docs/ontogenesis_L8_crystal_observer.md†L1-L50】【F:src/core/types/ontogenesis.ts†L1-L34】
