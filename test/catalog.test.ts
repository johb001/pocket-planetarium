import { describe, expect, it } from "vitest";

import { createCatalog, createCatalogForSky } from "../src/sky/catalog";

const hongKongObserver = { latitude: 22.3193, longitude: 114.1694, label: "Hong Kong" };
const observedAt = new Date("2026-01-01T14:00:00.000Z");

describe("createCatalog", () => {
  it("uses a real catalog independent of random seeds", () => {
    const first = createCatalog(1);
    const second = createCatalog(999);

    expect(first.stars.map((star) => star.id)).toEqual(second.stars.map((star) => star.id));
    expect(first.seed).toBe(0);
  });

  it("projects real stars into renderable fields", () => {
    const catalog = createCatalogForSky({ observer: hongKongObserver, observedAt });

    expect(catalog.stars.length).toBeGreaterThanOrEqual(20);
    expect(catalog.stars.some((star) => star.name === "Sirius")).toBe(true);
    expect(catalog.stars.some((star) => star.name === "Vega")).toBe(true);
    expect(new Set(catalog.stars.map((star) => star.id)).size).toBe(catalog.stars.length);

    for (const star of catalog.stars) {
      expect(star.id).toMatch(/^hyg-/);
      expect(star.name.length).toBeGreaterThan(0);
      expect(star.note.length).toBeGreaterThan(0);
      expect(Number.isFinite(star.x)).toBe(true);
      expect(Number.isFinite(star.y)).toBe(true);
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThanOrEqual(100);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThanOrEqual(100);
      expect(star.magnitude).toBeGreaterThanOrEqual(0);
      expect(star.magnitude).toBeLessThanOrEqual(1);
      expect(star.hue).toBeGreaterThanOrEqual(0);
      expect(star.hue).toBeLessThan(360);
    }
  });

  it("only references existing stars from constellation lines", () => {
    const catalog = createCatalogForSky({ observer: hongKongObserver, observedAt });
    const starIds = new Set(catalog.stars.map((star) => star.id));

    expect(catalog.constellations.length).toBeGreaterThan(0);

    for (const constellation of catalog.constellations) {
      for (const starId of constellation.starIds) {
        expect(starIds.has(starId)).toBe(true);
      }

      for (const [from, to] of constellation.lines) {
        expect(starIds.has(from)).toBe(true);
        expect(starIds.has(to)).toBe(true);
      }
    }
  });
});
