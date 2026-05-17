import type { Constellation, ObserverLocation, Star, StarCatalog } from "../types";
import { equatorialToHorizontal, projectHorizontal } from "./coordinates";
import { BRIGHT_STARS, type RealStar } from "./realCatalog";

export interface SkyCatalogContext {
  observer: ObserverLocation;
  observedAt: Date;
}

const DEFAULT_OBSERVER: ObserverLocation = {
  latitude: 22.3193,
  longitude: 114.1694,
  label: "Hong Kong"
};

const REAL_CONSTELLATIONS: Array<{ id: string; name: string; starIds: string[] }> = [
  { id: "constellation-orion", name: "Orion", starIds: ["hyg-betelgeuse", "hyg-bellatrix", "hyg-rigel", "hyg-saiph"] },
  { id: "constellation-winter-triangle", name: "Winter Triangle", starIds: ["hyg-sirius", "hyg-procyon", "hyg-betelgeuse"] },
  { id: "constellation-summer-triangle", name: "Summer Triangle", starIds: ["hyg-vega", "hyg-deneb", "hyg-altair"] },
  { id: "constellation-big-dipper", name: "Big Dipper", starIds: ["hyg-dubhe", "hyg-merak", "hyg-phecda", "hyg-megrez", "hyg-alioth", "hyg-mizar", "hyg-alkaid"] }
];

export function createCatalog(_seed = 0): StarCatalog {
  return createCatalogForSky({
    observer: DEFAULT_OBSERVER,
    observedAt: new Date("2026-01-01T14:00:00.000Z")
  });
}

export function createCatalogForSky(context: SkyCatalogContext): StarCatalog {
  const stars = BRIGHT_STARS.map((star) => projectRealStar(star, context));

  return {
    seed: 0,
    stars,
    constellations: createConstellations(stars)
  };
}

function projectRealStar(star: RealStar, context: SkyCatalogContext): Star {
  const horizontal = equatorialToHorizontal({
    rightAscensionHours: star.rightAscensionHours,
    declinationDegrees: star.declinationDegrees,
    observer: context.observer,
    observedAt: context.observedAt
  });
  const projected = projectHorizontal(horizontal, 100, 100);

  return {
    id: star.id,
    name: star.name,
    note: star.catalogName,
    x: round(projected.x),
    y: round(projected.y),
    magnitude: normalizeMagnitude(star.apparentMagnitude),
    hue: colorIndexToHue(star.colorIndex),
    visible: projected.visible,
    rightAscensionHours: star.rightAscensionHours,
    declinationDegrees: star.declinationDegrees,
    altitude: round(horizontal.altitude),
    azimuth: round(horizontal.azimuth),
    kind: "star"
  };
}

function createConstellations(stars: Star[]): Constellation[] {
  const starIds = new Set(stars.map((star) => star.id));

  return REAL_CONSTELLATIONS.map((constellation) => {
    const availableStarIds = constellation.starIds.filter((starId) => starIds.has(starId));
    const lines: Array<[string, string]> = availableStarIds
      .slice(1)
      .map((starId, index) => [availableStarIds[index], starId]);

    return {
      id: constellation.id,
      name: constellation.name,
      starIds: availableStarIds,
      lines
    };
  }).filter((constellation) => constellation.starIds.length > 1 && constellation.lines.length > 0);
}

function normalizeMagnitude(apparentMagnitude: number): number {
  return clamp((2.2 - apparentMagnitude) / 3.66, 0.08, 1);
}

function colorIndexToHue(colorIndex: number): number {
  return clamp(222 - colorIndex * 62, 26, 228);
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
