import { describe, expect, test } from "vitest";
import {
  equatorialToHorizontal,
  projectHorizontal,
  toJulianDate
} from "../src/sky/coordinates";

describe("sky coordinate conversion", () => {
  test("converts J2000 noon to Julian date 2451545.0", () => {
    expect(toJulianDate(new Date("2000-01-01T12:00:00.000Z"))).toBeCloseTo(2451545.0, 5);
  });

  test("puts a matching declination on the zenith when hour angle is zero", () => {
    const horizontal = equatorialToHorizontal({
      rightAscensionHours: 0,
      declinationDegrees: 22.3,
      observedAt: new Date("2000-01-01T12:00:00.000Z"),
      observer: { latitude: 22.3, longitude: -280.46158, label: "Test meridian" }
    });

    expect(horizontal.altitude).toBeCloseTo(90, 1);
  });

  test("marks below-horizon objects as not visible in projection", () => {
    const projected = projectHorizontal(
      { altitude: -5, azimuth: 180 },
      800,
      600
    );

    expect(projected.visible).toBe(false);
  });
});
