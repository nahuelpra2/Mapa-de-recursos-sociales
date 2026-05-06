import type { Coordinates } from "../types/resource";

export function isValidCoordinateValue(value: number) {
  return Number.isFinite(value);
}

export function isValidLatitude(value: number) {
  return isValidCoordinateValue(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number) {
  return isValidCoordinateValue(value) && value >= -180 && value <= 180;
}

export function hasValidCoordinates(coordinates: Coordinates | null | undefined): coordinates is Coordinates {
  return !!coordinates && isValidLatitude(coordinates.lat) && isValidLongitude(coordinates.lng);
}
