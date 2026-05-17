import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Observation, Star } from "../src/types";
import {
  createObservation,
  deleteObservation,
  loadObservations,
  restoreObservationState,
  saveObservations
} from "../src/state/observations";

const fixedNow = new Date("2026-05-17T08:00:00.000Z");

const stars: Star[] = [
  {
    id: "vega",
    name: "Vega",
    note: "Bright anchor in Lyra",
    x: 120,
    y: 80,
    magnitude: 0.03,
    hue: 210
  },
  {
    id: "altair",
    name: "Altair",
    note: "Fast spinner",
    x: 200,
    y: 140,
    magnitude: 0.76,
    hue: 180
  }
];

const observation: Observation = {
  id: "obs-1",
  title: "Northern window",
  createdAt: "2026-05-17T08:00:00.000Z",
  nightValue: 0.65,
  selectedStarId: "vega",
  accent: "#8bd3ff"
};

describe("observation persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates an observation from the current sky state", () => {
    const created = createObservation({
      title: "Northern window",
      nightValue: 0.65,
      selectedStarId: "vega",
      accent: "#8bd3ff"
    });

    expect(created).toMatchObject({
      title: "Northern window",
      createdAt: fixedNow.toISOString(),
      nightValue: 0.65,
      selectedStarId: "vega",
      accent: "#8bd3ff"
    });
    expect(created.id).toMatch(/^obs-/);
  });

  it("saves and loads observations through localStorage", () => {
    saveObservations([observation]);

    expect(loadObservations()).toEqual([observation]);
  });

  it("returns an empty list when localStorage contains damaged data", () => {
    localStorage.setItem("pocket-planetarium:observations", "{not json");

    expect(loadObservations()).toEqual([]);
    expect(localStorage.getItem("pocket-planetarium:observations")).toBeNull();
  });

  it("deletes an observation and persists the remaining list", () => {
    const second = { ...observation, id: "obs-2", title: "Balcony" };
    saveObservations([observation, second]);

    const remaining = deleteObservation("obs-1");

    expect(remaining).toEqual([second]);
    expect(loadObservations()).toEqual([second]);
  });

  it("restores night and selected star when the star still exists", () => {
    expect(restoreObservationState(observation, stars)).toEqual({
      nightValue: 0.65,
      selectedStarId: "vega"
    });
  });

  it("restores with no selected star when the saved star id is missing", () => {
    const restored = restoreObservationState(
      { ...observation, selectedStarId: "missing-star" },
      stars
    );

    expect(restored).toEqual({
      nightValue: 0.65,
      selectedStarId: undefined
    });
  });
});
