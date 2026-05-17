import { describe, expect, test } from "vitest";
import {
  applyZoomDistance,
  createDomeAtmosphereStars,
  guideLineOpacity,
  projectStarToDome
} from "../src/sky/render3d";
import type { Star } from "../src/types";

const visibleStar: Star = {
  id: "test-star",
  name: "Test Star",
  note: "test",
  x: 50,
  y: 50,
  magnitude: 1,
  hue: 210,
  visible: true
};

describe("projectStarToDome", () => {
  test("projects visible stars onto a 3D dome with depth", () => {
    const projected = projectStarToDome(visibleStar, 12);

    expect(projected.visible).toBe(true);
    expect(projected.position.z).toBeLessThanOrEqual(-6);
    expect(projected.position.z).toBeGreaterThanOrEqual(-18);
    expect(projected.scale).toBeGreaterThan(0);
  });

  test("keeps hidden stars out of the 3D scene", () => {
    const projected = projectStarToDome({ ...visibleStar, visible: false }, 12);

    expect(projected.visible).toBe(false);
  });
});

describe("createDomeAtmosphereStars", () => {
  test("creates deterministic background stars with varied depths", () => {
    const first = createDomeAtmosphereStars(260, 0.24);
    const second = createDomeAtmosphereStars(260, 0.24);
    const uniqueDepths = new Set(first.map((star) => Math.round(star.position.z * 10)));

    expect(first).toEqual(second);
    expect(first).toHaveLength(260);
    expect(uniqueDepths.size).toBeGreaterThan(12);
    expect(first.every((star) => star.position.z < -2)).toBe(true);
  });
});

describe("3D interaction helpers", () => {
  test("keeps wheel zoom within a comfortable range", () => {
    expect(applyZoomDistance(18, -240)).toBeLessThan(18);
    expect(applyZoomDistance(18, 240)).toBeGreaterThan(18);
    expect(applyZoomDistance(12, -5000)).toBe(10);
    expect(applyZoomDistance(27, 5000)).toBe(30);
  });

  test("keeps guide lines hidden by default and subtle when enabled", () => {
    expect(guideLineOpacity(false)).toBe(0);
    expect(guideLineOpacity(true)).toBeGreaterThan(0);
    expect(guideLineOpacity(true)).toBeLessThan(0.12);
  });
});
