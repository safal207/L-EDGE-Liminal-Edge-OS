import { describe, expect, it } from "vitest";

import { updateMineralProfile } from "../L27_mineral_buffer";
import type { MineralProfile } from "../../../layers/L27_MineralLayer/types";
import type { ResourceState } from "../L25_cell_kernel";

describe("L27 mineral buffer", () => {
  it("drains reserves under sustained strain", () => {
    let profile: MineralProfile = { baselineReserve: 0.8, currentReserve: 0.8, depletionLevel: 0 };
    const strained: ResourceState = {
      energy: 0.8,
      mineralReserve: 0.7,
      strain: 0.8,
      regenerationTendency: 0.3,
    };

    for (let i = 0; i < 5; i++) {
      profile = updateMineralProfile(profile, strained);
    }

    expect(profile.currentReserve).toBeLessThan(0.7);
    expect(profile.depletionLevel).toBeGreaterThan(0.1);
  });

  it("refills toward baseline when calm and regenerative", () => {
    let profile: MineralProfile = { baselineReserve: 0.8, currentReserve: 0.4, depletionLevel: 0.5 };
    const recovering: ResourceState = {
      energy: 0.5,
      mineralReserve: 0.5,
      strain: 0.2,
      regenerationTendency: 0.8,
    };

    for (let i = 0; i < 6; i++) {
      profile = updateMineralProfile(profile, recovering);
    }

    expect(profile.currentReserve).toBeGreaterThan(0.55);
    expect(profile.depletionLevel).toBeLessThan(0.35);
  });
});
