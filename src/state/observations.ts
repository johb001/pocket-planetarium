import type { AppState, Observation, Star } from "../types";

export const OBSERVATIONS_STORAGE_KEY = "pocket-planetarium:observations";

export interface CreateObservationInput {
  title: string;
  nightValue: number;
  selectedStarId?: string;
  accent: string;
}

export type RestoredObservationState = Pick<AppState, "nightValue" | "selectedStarId">;

function getStorage(): Storage | undefined {
  return globalThis.localStorage;
}

function isObservation(value: unknown): value is Observation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const observation = value as Partial<Observation>;

  return (
    typeof observation.id === "string" &&
    typeof observation.title === "string" &&
    typeof observation.createdAt === "string" &&
    typeof observation.nightValue === "number" &&
    Number.isFinite(observation.nightValue) &&
    (observation.selectedStarId === undefined ||
      typeof observation.selectedStarId === "string") &&
    typeof observation.accent === "string"
  );
}

function removeStoredObservations(storage: Storage): void {
  try {
    storage.removeItem(OBSERVATIONS_STORAGE_KEY);
  } catch {
    // Some storage implementations can throw when access is blocked.
  }
}

export function createObservation(input: CreateObservationInput): Observation {
  return {
    id: `obs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title,
    createdAt: new Date().toISOString(),
    nightValue: input.nightValue,
    selectedStarId: input.selectedStarId,
    accent: input.accent
  };
}

export function loadObservations(): Observation[] {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  let raw: string | null;

  try {
    raw = storage.getItem(OBSERVATIONS_STORAGE_KEY);
  } catch {
    return [];
  }

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      removeStoredObservations(storage);
      return [];
    }

    const observations = parsed.filter(isObservation);

    if (observations.length !== parsed.length) {
      saveObservations(observations);
    }

    return observations;
  } catch {
    removeStoredObservations(storage);
    return [];
  }
}

export function saveObservations(observations: Observation[]): void {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(OBSERVATIONS_STORAGE_KEY, JSON.stringify(observations));
}

export function deleteObservation(id: string): Observation[] {
  const observations = loadObservations().filter((observation) => observation.id !== id);

  saveObservations(observations);

  return observations;
}

export function restoreObservationState(
  observation: Observation,
  stars: Pick<Star, "id">[]
): RestoredObservationState {
  const selectedStarExists =
    observation.selectedStarId !== undefined &&
    stars.some((star) => star.id === observation.selectedStarId);

  return {
    nightValue: observation.nightValue,
    selectedStarId: selectedStarExists ? observation.selectedStarId : undefined
  };
}
