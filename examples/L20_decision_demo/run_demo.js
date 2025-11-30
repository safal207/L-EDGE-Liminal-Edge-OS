require("ts-node/register");

const { L20_ResonantDecisionOrchestrator } = require("../../layers/L20_ResonantDecision");
const demo = require("./inputs_example.json");

function runDemo() {
  const { innerState, contextState, flowState, externalCandidates } = demo;

  const result = L20_ResonantDecisionOrchestrator(
    innerState,
    contextState,
    flowState,
    externalCandidates
  );

  console.log("=== L20 Decision Demo ===");
  console.log("Chosen decision:");
  console.dir(result.decision, { depth: null });

  console.log("\nScored candidates:");
  console.dir(result.candidates, { depth: null });
}

runDemo();
