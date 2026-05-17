import type { SkyMoment } from "../types";

type Rgb = [number, number, number];

const DUSK = {
  zenith: [5, 10, 32] as Rgb,
  horizon: [28, 30, 48] as Rgb,
  glow: [58, 70, 108] as Rgb,
};

const MIDNIGHT = {
  zenith: [4, 9, 28] as Rgb,
  horizon: [18, 24, 52] as Rgb,
  glow: [80, 108, 168] as Rgb,
};

const DAWN = {
  zenith: [7, 18, 52] as Rgb,
  horizon: [42, 42, 66] as Rgb,
  glow: [72, 86, 126] as Rgb,
};

export function clampNightValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

export function getSkyMoment(nightValue: number): SkyMoment {
  const value = clampNightValue(nightValue);

  return {
    value,
    label: formatNightLabel(value),
    rotation: value * 360,
    colors: {
      zenith: interpolateNightColor(value, "zenith"),
      horizon: interpolateNightColor(value, "horizon"),
      glow: interpolateNightColor(value, "glow"),
    },
    labelDensity: 0.35 + (1 - Math.abs(value - 0.5) * 2) * 0.65,
  };
}

function formatNightLabel(value: number): string {
  const minutesAfterDusk = Math.round(value * 12 * 60);
  const totalMinutes = (18 * 60 + minutesAfterDusk) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${padTime(hours)}:${padTime(minutes)}`;
}

function interpolateNightColor(value: number, colorName: keyof SkyMoment["colors"]): string {
  const start = value <= 0.5 ? DUSK[colorName] : MIDNIGHT[colorName];
  const end = value <= 0.5 ? MIDNIGHT[colorName] : DAWN[colorName];
  const progress = value <= 0.5 ? value / 0.5 : (value - 0.5) / 0.5;

  return toRgbString(lerpRgb(start, end, progress));
}

function lerpRgb(start: Rgb, end: Rgb, progress: number): Rgb {
  return [
    lerpChannel(start[0], end[0], progress),
    lerpChannel(start[1], end[1], progress),
    lerpChannel(start[2], end[2], progress),
  ];
}

function lerpChannel(start: number, end: number, progress: number): number {
  return Math.round(start + (end - start) * progress);
}

function toRgbString([red, green, blue]: Rgb): string {
  return `rgb(${red}, ${green}, ${blue})`;
}

function padTime(value: number): string {
  return value.toString().padStart(2, "0");
}
