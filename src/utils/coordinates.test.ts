import { describe, expect, it } from "vitest";
import { hasValidCoordinates, isValidCoordinateValue, isValidLatitude, isValidLongitude } from "./coordinates";

describe("coordinates validation", () => {
  it("accepts finite numeric coordinate values", () => {
    expect(isValidCoordinateValue(0)).toBe(true);
    expect(isValidCoordinateValue(-34.6037)).toBe(true);
  });

  it("rejects non-finite coordinate values", () => {
    expect(isValidCoordinateValue(Number.NaN)).toBe(false);
    expect(isValidCoordinateValue(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidCoordinateValue(Number.NEGATIVE_INFINITY)).toBe(false);
  });

  it("validates latitude and longitude ranges independently", () => {
    expect(isValidLatitude(-90)).toBe(true);
    expect(isValidLatitude(90)).toBe(true);
    expect(isValidLatitude(-90.1)).toBe(false);
    expect(isValidLatitude(90.1)).toBe(false);

    expect(isValidLongitude(-180)).toBe(true);
    expect(isValidLongitude(180)).toBe(true);
    expect(isValidLongitude(-180.1)).toBe(false);
    expect(isValidLongitude(180.1)).toBe(false);
  });

  it("requires both latitude and longitude to be present and in range", () => {
    expect(hasValidCoordinates({ lat: -34.6037, lng: -58.3816 })).toBe(true);
    expect(hasValidCoordinates({ lat: 120, lng: -58.3816 })).toBe(false);
    expect(hasValidCoordinates({ lat: -34.6037, lng: -220 })).toBe(false);
    expect(hasValidCoordinates(null)).toBe(false);
    expect(hasValidCoordinates(undefined)).toBe(false);
  });
});
