import { describe, expect, it } from "vitest";

import { findNearestStar } from "../src/sky/hitTest";
import type { Star } from "../src/types";

function star(id: string): Star {
  return {
    id,
    name: id,
    note: `${id} note`,
    x: 0,
    y: 0,
    magnitude: 0.5,
    hue: 180,
  };
}

describe("findNearestStar", () => {
  it("returns the closest star within the threshold", () => {
    const near = star("near");
    const closer = star("closer");

    const result = findNearestStar(
      [
        { star: near, x: 12, y: 10 },
        { star: closer, x: 8, y: 10 },
      ],
      { x: 10, y: 10 },
      3,
    );

    expect(result).toBe(closer);
  });

  it("returns undefined when no star is inside the threshold", () => {
    const result = findNearestStar(
      [{ star: star("outside"), x: 14, y: 10 }],
      { x: 10, y: 10 },
      3,
    );

    expect(result).toBeUndefined();
  });
});
