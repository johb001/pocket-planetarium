import { Body, Equator, Horizon, Observer } from "astronomy-engine";
import type { ObserverLocation, Star } from "../types";
import { projectHorizontal } from "./coordinates";

export interface SolarSystemContext {
  observer: ObserverLocation;
  observedAt: Date;
}

interface SolarSystemBodyConfig {
  body: Body;
  id: string;
  name: string;
  hue: number;
  magnitude: number;
  kind: "sun" | "moon" | "planet";
}

const SOLAR_SYSTEM_BODIES: SolarSystemBodyConfig[] = [
  { body: Body.Sun, id: "body-sun", name: "Sun", hue: 44, magnitude: 1, kind: "sun" },
  { body: Body.Moon, id: "body-moon", name: "Moon", hue: 58, magnitude: 0.92, kind: "moon" },
  { body: Body.Mercury, id: "body-mercury", name: "Mercury", hue: 38, magnitude: 0.5, kind: "planet" },
  { body: Body.Venus, id: "body-venus", name: "Venus", hue: 50, magnitude: 0.78, kind: "planet" },
  { body: Body.Mars, id: "body-mars", name: "Mars", hue: 18, magnitude: 0.66, kind: "planet" },
  { body: Body.Jupiter, id: "body-jupiter", name: "Jupiter", hue: 35, magnitude: 0.74, kind: "planet" },
  { body: Body.Saturn, id: "body-saturn", name: "Saturn", hue: 46, magnitude: 0.58, kind: "planet" }
];

export function getSolarSystemObjects(context: SolarSystemContext): Star[] {
  if (!isValidContext(context)) {
    return [];
  }

  try {
    const observer = new Observer(context.observer.latitude, context.observer.longitude, 0);

    return SOLAR_SYSTEM_BODIES.map((config) => createBodyStar(config, context.observedAt, observer));
  } catch {
    return [];
  }
}

function createBodyStar(config: SolarSystemBodyConfig, observedAt: Date, observer: Observer): Star {
  const equatorial = Equator(config.body, observedAt, observer, true, true);
  const horizontal = Horizon(observedAt, observer, equatorial.ra, equatorial.dec, "normal");
  const projected = projectHorizontal(
    { altitude: horizontal.altitude, azimuth: horizontal.azimuth },
    100,
    100
  );

  return {
    id: config.id,
    name: config.name,
    note: `${config.name} solar system object`,
    x: round(projected.x),
    y: round(projected.y),
    magnitude: config.magnitude,
    hue: config.hue,
    visible: projected.visible,
    rightAscensionHours: round(equatorial.ra),
    declinationDegrees: round(equatorial.dec),
    altitude: round(horizontal.altitude),
    azimuth: round(horizontal.azimuth),
    kind: config.kind
  };
}

function isValidContext(context: SolarSystemContext): boolean {
  return (
    Number.isFinite(context.observer.latitude) &&
    Number.isFinite(context.observer.longitude) &&
    context.observer.latitude >= -90 &&
    context.observer.latitude <= 90 &&
    context.observer.longitude >= -180 &&
    context.observer.longitude <= 180 &&
    Number.isFinite(context.observedAt.getTime())
  );
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}
