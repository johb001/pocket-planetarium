import { describe, expect, test } from "vitest";
import { BRIGHT_STARS } from "../src/sky/realCatalog";

describe("real bright star catalog", () => {
  test("contains recognizable bright stars", () => {
    const names = BRIGHT_STARS.map((star) => star.name);

    expect(names).toContain("Sirius");
    expect(names).toContain("Vega");
    expect(names).toContain("Polaris");
  });

  test("keeps real star coordinate fields valid", () => {
    expect(BRIGHT_STARS.length).toBeGreaterThanOrEqual(20);

    for (const star of BRIGHT_STARS) {
      expect(star.id).toMatch(/^hyg-/);
      expect(star.rightAscensionHours).toBeGreaterThanOrEqual(0);
      expect(star.rightAscensionHours).toBeLessThan(24);
      expect(star.declinationDegrees).toBeGreaterThanOrEqual(-90);
      expect(star.declinationDegrees).toBeLessThanOrEqual(90);
      expect(Number.isFinite(star.apparentMagnitude)).toBe(true);
    }
  });
});
