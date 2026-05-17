import { describe, expect, it } from "vitest";

import { createCatalog } from "../src/sky/catalog";

describe("createCatalog", () => {
  it("returns a stable catalog for the default seed", () => {
    const first = createCatalog();
    const second = createCatalog(42);

    expect(first).toEqual(second);
    expect(first.seed).toBe(42);
  });

  it("creates at least 72 stars with valid Star fields", () => {
    const catalog = createCatalog();

    expect(catalog.stars.length).toBeGreaterThanOrEqual(72);
    expect(new Set(catalog.stars.map((star) => star.id)).size).toBe(catalog.stars.length);

    for (const star of catalog.stars) {
      expect(star.id).toMatch(/^star-\d{3}$/);
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
    const catalog = createCatalog();
    const starIds = new Set(catalog.stars.map((star) => star.id));

    expect(catalog.constellations.length).toBeGreaterThan(0);

    for (const constellation of catalog.constellations) {
      expect(constellation.id.length).toBeGreaterThan(0);
      expect(constellation.name.length).toBeGreaterThan(0);
      expect(constellation.starIds.length).toBeGreaterThan(1);
      expect(constellation.lines.length).toBeGreaterThan(0);

      for (const starId of constellation.starIds) {
        expect(starIds.has(starId)).toBe(true);
      }

      for (const [from, to] of constellation.lines) {
        expect(starIds.has(from)).toBe(true);
        expect(starIds.has(to)).toBe(true);
        expect(constellation.starIds).toContain(from);
        expect(constellation.starIds).toContain(to);
      }
    }
  });
});
