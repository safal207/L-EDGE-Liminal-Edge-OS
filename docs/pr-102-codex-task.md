# PR-102 — TypeScript cleanup for core/systemContext and related files

> **Goal:** Make `npm run check` pass without changing the runtime behaviour of existing L-layers and examples (including L21 Flow Dashboard and L22 Narrative Field Engine).

---

## 1. Context

The repository now contains several new layers (L0–L22), a flow dashboard demo (L21) and a narrative field engine (L22).  
TypeScript checks are currently failing due to **pre-existing errors** in shared core files, mainly:

- `core/systemContext.ts`
- and other modules that import or redeclare the same types/variables.

These errors block further work on UI and examples.  
This PR is purely **technical cleanup**: the behaviour of the system must remain the same.

---

## 2. Tasks

### 2.1. Fix TypeScript errors in core

Main focus:

- `core/systemContext.ts`
- any other files reported by `npm run check` as part of the same error chain.

Required actions:

1. **Remove redeclared variables / types**

  - If a variable or type is declared multiple times across modules, extract it into a shared module (for example `core/types.ts`) and import it where needed.
  - Avoid `declare var ...` hacks; prefer proper imports/exports.

2. **Stabilise core typings**

  - Ensure `SystemContext`, `LayerId`, `LayerState` and other core types are defined exactly once and reused.
  - Replace `any` with more precise types where it is easy and safe to do so.
  - Where the type is unclear, use `unknown` + narrow it locally, instead of `any`.

3. **Do NOT change runtime semantics**

  - Do not modify business logic of L-layers.
  - Do not remove fields or change data shapes expected by current code.
  - If a refactor is required to satisfy TypeScript, keep the same inputs/outputs from the perspective of public APIs.

### 2.2. Keep L21 / L22 examples compiling

- Make sure that:
  - `examples/L21FlowDashboardDemo` still imports context/types correctly.
  - L22 narrative engine (and its typings) still build and type-check.
- It is OK if the demo UI is minimal; the important part is that the TypeScript project **compiles cleanly**.

---

## 3. Non-goals

- No need to redesign architecture or L-layer concepts.
- No need to add new features or UI elements.
- No need to change ESLint/Prettier configuration (unless required to fix TS errors in a minimal way).

---

## 4. How to verify

From the repo root:

1. Install dependencies (if not already done):

  ```bash
  npm install

2. Run TypeScript check:

npm run check

Expected result: command finishes successfully with exit code 0 and without TypeScript error messages.


3. (Optional, but desirable) Run build to ensure the project still compiles:

npm run build




---

5. Acceptance criteria

npm run check passes with no TypeScript errors.

No runtime behaviour changes for existing layers and examples.

Core types (SystemContext, LayerId, LayerState, etc.) are defined in a single, shared place and imported where needed.

The codebase becomes easier to extend for future layers (L23+).


---

## How to proceed

1. Create a branch for PR-102.  
2. Add the file `docs/pr-102-codex-task.md` with this text.  
3. Push, open PR, and hand it off to Codex as the task "Fix TypeScript errors (PR-102)".  
