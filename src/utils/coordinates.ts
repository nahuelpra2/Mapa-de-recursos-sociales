import type { Coordinates } from "../types/resource";

export function isValidCoordinateValue(value: number) {
  return Number.isFinite(value);
}

export function hasValidCoordinates(coordinates: Coordinates | null | undefined): coordinates is Coordinates {
  return !!coordinates && isValidCoordinateValue(coordinates.lat) && isValidCoordinateValue(coordinates.lng);
}
