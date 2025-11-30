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
    expect(result.pressure.zone).toBe("high");
    expect(result.pressure.color).toBe("#F44336");
    expect(result.meaning.affectedAxis).toBe("outer");
    expect(result.summary).toContain("cpu_load_high");
  });

  it("maps pressure colors to the defined scale", () => {
    expect(getPressureColor(0.1).name).toBe("low");
    expect(getPressureColor(0.1).hex).toBe("#4CAF50");
    expect(getPressureColor(0.5).name).toBe("medium");
    expect(getPressureColor(0.5).label).toBe("среднее давление");
    expect(getPressureColor(0.7).name).toBe("high");
    expect(getPressureColor(0.7).hex).toBe("#F44336");
  });

  it("normalizes incoming signals", () => {
    const normalized = processSignal({});
    expect(normalized.source).toBe("external");
    expect(normalized.type).toBe("event");
    expect(normalized.confidence).toBe(0.5);
    expect(normalized.payload).toEqual({});
  });
});
