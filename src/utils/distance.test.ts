import { describe, expect, it } from "vitest";
import { calculateDistanceKm, formatDistance } from "./distance";

describe("distance utilities", () => {
  it("returns zero for the same coordinates", () => {
    const coordinates = { lat: -34.6037, lng: -58.3816 };

    expect(calculateDistanceKm(coordinates, coordinates)).toBeCloseTo(0, 6);
  });

  it("calculates an approximate walking-scale distance between nearby points", () => {
    const obelisco = { lat: -34.6037, lng: -58.3816 };
    const plazaDeMayo = { lat: -34.6083, lng: -58.3712 };

    expect(calculateDistanceKm(obelisco, plazaDeMayo)).toBeCloseTo(1.08, 1);
  });

  it("formats missing, meter, and kilometer distances for display", () => {
    expect(formatDistance()).toBe("Sin origen seleccionado");
    expect(formatDistance(0.42)).toBe("420 m");
    expect(formatDistance(1.234)).toBe("1.2 km");
  });
});
