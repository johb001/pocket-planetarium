import { describe, expect, it } from "vitest";

import { clampNightValue, getSkyMoment } from "../src/sky/time";

const rgbPattern = /^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/;

describe("clampNightValue", () => {
  it("keeps night values within 0 and 1", () => {
    expect(clampNightValue(-0.25)).toBe(0);
    expect(clampNightValue(0)).toBe(0);
    expect(clampNightValue(0.5)).toBe(0.5);
    expect(clampNightValue(1)).toBe(1);
    expect(clampNightValue(1.25)).toBe(1);
  });
});

describe("getSkyMoment", () => {
  it("maps the night slider endpoints and midpoint to clock labels", () => {
    expect(getSkyMoment(0).label).toBe("18:00");
    expect(getSkyMoment(0.5).label).toBe("00:00");
    expect(getSkyMoment(1).label).toBe("06:00");
  });

  it("keeps derived values bounded for out-of-range input", () => {
    for (const input of [-2, -0.1, 0, 0.25, 0.5, 0.75, 1, 1.1, 3]) {
      const moment = getSkyMoment(input);

      expect(moment.value).toBeGreaterThanOrEqual(0);
      expect(moment.value).toBeLessThanOrEqual(1);
      expect(moment.rotation).toBeGreaterThanOrEqual(0);
      expect(moment.rotation).toBeLessThanOrEqual(360);
      expect(moment.labelDensity).toBeGreaterThanOrEqual(0);
      expect(moment.labelDensity).toBeLessThanOrEqual(1);
    }
  });

  it("returns CSS rgb strings for sky colors", () => {
    const { colors } = getSkyMoment(0.5);

    expect(colors.zenith).toMatch(rgbPattern);
    expect(colors.horizon).toMatch(rgbPattern);
    expect(colors.glow).toMatch(rgbPattern);
  });

  it("keeps early evening dark enough to read as a starry sky", () => {
    const { colors } = getSkyMoment(0.08);
    const horizon = parseRgb(colors.horizon);
    const glow = parseRgb(colors.glow);

    expect(Math.max(...horizon)).toBeLessThanOrEqual(112);
    expect(Math.max(...glow)).toBeLessThanOrEqual(150);
  });
});

function parseRgb(value: string): [number, number, number] {
  const match = value.match(/^rgb\((\d{1,3}), (\d{1,3}), (\d{1,3})\)$/);

  if (!match) {
    throw new Error(`Expected rgb() color, received ${value}`);
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}
