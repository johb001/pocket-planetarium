import { describe, expect, test } from "vitest";
import { createAtmosphereStars } from "../src/sky/render";

describe("atmosphere star field", () => {
  test("creates a deterministic dense star layer inside the dome", () => {
    const first = createAtmosphereStars({
      width: 1200,
      height: 800,
      rotation: 0.42,
      compact: false
    });
    const second = createAtmosphereStars({
      width: 1200,
      height: 800,
      rotation: 0.42,
      compact: false
    });

    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThanOrEqual(210);
    expect(first.every((star) => star.x >= 0 && star.x <= 1200)).toBe(true);
    expect(first.every((star) => star.y >= 0 && star.y <= 800)).toBe(true);
    expect(first.every((star) => star.alpha > 0 && star.alpha <= 0.72)).toBe(true);
  });
});
