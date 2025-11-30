import { describe, expect, it } from "vitest";
import { L19_ExternalContext, processSignal, getPressureColor } from "./index";

describe("L19 External Context Layer", () => {
  it("converts a metric into contextualized bridge output", () => {
    const result = L19_ExternalContext({
      source: "system",
      type: "metric",
      payload: { cpu_usage: 0.83 },
      timestamp: 1732829384,
      confidence: 0.96,
    });

    expect(result.ctxSignal.source).toBe("system");
    expect(result.relevance.relevance).toBeGreaterThan(0.7);
    expect(result.pressure.pressureType).toBe("challenge");
    expect(result.pressure.color).toBe("🟧");
    expect(result.meaning.affectedAxis).toBe("outer");
    expect(result.summary).toContain("cpu_load_high");
  });

  it("maps pressure colors to the defined scale", () => {
    expect(getPressureColor(0.1)).toBe("🟦");
    expect(getPressureColor(0.3)).toBe("🟩");
    expect(getPressureColor(0.5)).toBe("🟨");
    expect(getPressureColor(0.7)).toBe("🟧");
    expect(getPressureColor(0.9)).toBe("🟥");
    expect(getPressureColor(1.3)).toBe("🟪");
  });

  it("normalizes incoming signals", () => {
    const normalized = processSignal({});
    expect(normalized.source).toBe("external");
    expect(normalized.type).toBe("event");
    expect(normalized.confidence).toBe(0.5);
    expect(normalized.payload).toEqual({});
  });
});
