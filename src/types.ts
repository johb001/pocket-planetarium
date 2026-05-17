export interface Star {
  id: string;
  name: string;
  note: string;
  x: number;
  y: number;
  magnitude: number;
  hue: number;
  visible?: boolean;
  rightAscensionHours?: number;
  declinationDegrees?: number;
  altitude?: number;
  azimuth?: number;
  kind?: SkyObjectKind;
}

export interface Constellation {
  id: string;
  name: string;
  starIds: string[];
  lines: Array<[string, string]>;
}

export interface StarCatalog {
  seed: number;
  stars: Star[];
  constellations: Constellation[];
}

export interface SkyMoment {
  value: number;
  label: string;
  rotation: number;
  colors: {
    zenith: string;
    horizon: string;
    glow: string;
  };
  labelDensity: number;
}

export interface Observation {
  id: string;
  title: string;
  createdAt: string;
  nightValue: number;
  selectedStarId?: string;
  accent: string;
}

export interface AppState {
  nightValue: number;
  selectedStarId?: string;
  showConstellations: boolean;
  showLabels: boolean;
  observations: Observation[];
  locale: Locale;
  observer: ObserverLocation;
  observedAt: string;
  errorMessage?: string;
}

export type Locale = "zh" | "en";

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  label: string;
}

export type SkyObjectKind = "star" | "sun" | "moon" | "planet";
