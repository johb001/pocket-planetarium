import { describe, expect, test } from "vitest";
import { getSolarSystemObjects } from "../src/sky/solarSystem";

const observer = { latitude: 22.3193, longitude: 114.1694, label: "Hong Kong" };
const observedAt = new Date("2026-01-01T14:00:00.000Z");

describe("solar system sky objects", () => {
  test("returns stable renderable objects for a known observer and time", () => {
    const objects = getSolarSystemObjects({ observer, observedAt });
    const names = objects.map((object) => object.name);

    expect(names).toContain("Sun");
    expect(names).toContain("Moon");
    expect(names).toContain("Mars");

    for (const object of objects) {
      expect(object.id).toMatch(/^body-/);
      expect(object.kind).not.toBe("star");
      expect(Number.isFinite(object.x)).toBe(true);
      expect(Number.isFinite(object.y)).toBe(true);
      expect(object.x).toBeGreaterThanOrEqual(0);
      expect(object.x).toBeLessThanOrEqual(100);
      expect(object.y).toBeGreaterThanOrEqual(0);
      expect(object.y).toBeLessThanOrEqual(100);
    }
  });

  test("returns an empty array when calculation input is invalid", () => {
    expect(getSolarSystemObjects({
      observer: { latitude: Number.NaN, longitude: 114.1694, label: "Invalid" },
      observedAt
    })).toEqual([]);
  });
});
