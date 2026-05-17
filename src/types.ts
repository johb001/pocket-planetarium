export interface Star {
  id: string;
  name: string;
  note: string;
  x: number;
  y: number;
  magnitude: number;
  hue: number;
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
}
