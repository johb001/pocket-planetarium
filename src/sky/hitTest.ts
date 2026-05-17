import type { Star } from "../types";

export interface StarHitPoint {
  star: Star;
  x: number;
  y: number;
}

export interface PointerPoint {
  x: number;
  y: number;
}

export function findNearestStar(
  points: StarHitPoint[],
  pointer: PointerPoint,
  threshold: number,
): Star | undefined {
  const thresholdSquared = threshold * threshold;
  let nearest: StarHitPoint | undefined;
  let nearestDistanceSquared = thresholdSquared;

  for (const point of points) {
    const deltaX = point.x - pointer.x;
    const deltaY = point.y - pointer.y;
    const distanceSquared = deltaX * deltaX + deltaY * deltaY;

    if (distanceSquared <= nearestDistanceSquared) {
      nearest = point;
      nearestDistanceSquared = distanceSquared;
    }
  }

  return nearest?.star;
}
