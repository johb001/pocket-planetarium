import type { Constellation, Star, StarCatalog } from "../types";

const STAR_COUNT = 84;
const CONSTELLATION_SIZE = 7;

const STAR_NAMES = [
  "Aster",
  "Bellatrix",
  "Caelum",
  "Deneb",
  "Elara",
  "Fomal",
  "Gemma",
  "Hadar",
  "Izar",
  "Jabbah",
  "Kaus",
  "Lumen",
  "Mira",
  "Nashira",
  "Orion",
  "Polaris",
  "Rigel",
  "Sabik",
  "Tania",
  "Unuk",
  "Vega",
  "Wasat",
  "Xuange",
  "Yildun"
];

const STAR_NOTES = [
  "steady white pinprick",
  "warm ember sparkle",
  "blue twilight marker",
  "quiet horizon guide",
  "soft lantern point",
  "clear chart anchor",
  "faint silver glimmer"
];

const CONSTELLATION_NAMES = [
  "Lantern Arc",
  "Compass Kite",
  "Harbor Crown",
  "Silver Reed",
  "Ember Ladder",
  "Glass Heron",
  "Wayfinder Loop",
  "Aurora Needle",
  "Tide Hook",
  "Moon Gate",
  "Cinder Sail",
  "North Thread"
];

function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function createStars(seed: number): Star[] {
  const random = createRandom(seed);

  return Array.from({ length: STAR_COUNT }, (_, index) => {
    const band = index % CONSTELLATION_SIZE;
    const row = Math.floor(index / CONSTELLATION_SIZE);
    const name = STAR_NAMES[index % STAR_NAMES.length];

    return {
      id: `star-${String(index + 1).padStart(3, "0")}`,
      name: `${name} ${row + 1}`,
      note: STAR_NOTES[index % STAR_NOTES.length],
      x: round(8 + band * 14 + random() * 6),
      y: round(8 + row * 7 + random() * 4),
      magnitude: round(0.18 + random() * 0.72),
      hue: round((185 + random() * 150) % 360)
    };
  });
}

function createConstellations(): Constellation[] {
  return CONSTELLATION_NAMES.map((name, index) => {
    const start = index * CONSTELLATION_SIZE;
    const starIds = Array.from({ length: CONSTELLATION_SIZE }, (_, offset) => {
      return `star-${String(start + offset + 1).padStart(3, "0")}`;
    });

    return {
      id: `constellation-${String(index + 1).padStart(2, "0")}`,
      name,
      starIds,
      lines: starIds.slice(1).map((starId, offset) => [starIds[offset], starId])
    };
  });
}

export function createCatalog(seed = 42): StarCatalog {
  return {
    seed,
    stars: createStars(seed),
    constellations: createConstellations()
  };
}
