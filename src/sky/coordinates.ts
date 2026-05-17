import type { ObserverLocation } from "../types";

export interface EquatorialCoordinates {
  rightAscensionHours: number;
  declinationDegrees: number;
}

export interface HorizontalCoordinates {
  altitude: number;
  azimuth: number;
}

export interface EquatorialToHorizontalInput extends EquatorialCoordinates {
  observedAt: Date;
  observer: ObserverLocation;
}

export interface ProjectedHorizontalPoint {
  x: number;
  y: number;
  visible: boolean;
}

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function getLocalSiderealTimeDegrees(date: Date, longitudeDegrees: number): number {
  const julianDate = toJulianDate(date);
  const daysSinceJ2000 = julianDate - 2451545.0;
  const greenwichSiderealTime =
    280.46061837 +
    360.98564736629 * daysSinceJ2000 +
    0.000387933 * (daysSinceJ2000 / 36525) ** 2 -
    ((daysSinceJ2000 / 36525) ** 3) / 38710000;

  return normalizeDegrees(greenwichSiderealTime + longitudeDegrees);
}

export function equatorialToHorizontal(input: EquatorialToHorizontalInput): HorizontalCoordinates {
  const latitudeRad = input.observer.latitude * DEG_TO_RAD;
  const declinationRad = input.declinationDegrees * DEG_TO_RAD;
  const rightAscensionDegrees = input.rightAscensionHours * 15;
  const siderealDegrees = getLocalSiderealTimeDegrees(input.observedAt, input.observer.longitude);
  const hourAngleRad = normalizeDegrees(siderealDegrees - rightAscensionDegrees) * DEG_TO_RAD;
  const sinAltitude =
    Math.sin(declinationRad) * Math.sin(latitudeRad) +
    Math.cos(declinationRad) * Math.cos(latitudeRad) * Math.cos(hourAngleRad);
  const altitudeRad = Math.asin(clamp(sinAltitude, -1, 1));
  const azimuthRad = Math.atan2(
    -Math.sin(hourAngleRad),
    Math.tan(declinationRad) * Math.cos(latitudeRad) -
      Math.sin(latitudeRad) * Math.cos(hourAngleRad)
  );

  return {
    altitude: altitudeRad * RAD_TO_DEG,
    azimuth: normalizeDegrees(azimuthRad * RAD_TO_DEG)
  };
}

export function projectHorizontal(
  coordinates: HorizontalCoordinates,
  width: number,
  height: number
): ProjectedHorizontalPoint {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const visible = coordinates.altitude >= 0;
  const radius = Math.min(safeWidth, safeHeight) * 0.44;
  const zenithDistance = clamp((90 - Math.max(0, coordinates.altitude)) / 90, 0, 1);
  const azimuthRad = (coordinates.azimuth - 90) * DEG_TO_RAD;

  return {
    x: safeWidth / 2 + Math.cos(azimuthRad) * radius * zenithDistance,
    y: safeHeight / 2 + Math.sin(azimuthRad) * radius * zenithDistance,
    visible
  };
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
