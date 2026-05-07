import { describe, expect, it } from "vitest";
import { createResource } from "../test/fixtures/resources";
import { createMapLink, getResourceCoordinates } from "./maps";

const resource = createResource({
  id: "test-resource",
  nombre: "Recurso de prueba",
  tipo: "Centro de atención",
  direccion: "Calle falsa 123",
  lat: -34.6037,
  lng: -58.3816
});

describe("map helpers", () => {
  it("extracts resource coordinates", () => {
    expect(getResourceCoordinates(resource)).toEqual({ lat: -34.6037, lng: -58.3816 });
  });

  it("creates a marker link when no origin is provided", () => {
    expect(createMapLink(resource)).toBe(
      "https://www.openstreetmap.org/?mlat=-34.6037&mlon=-58.3816#map=17/-34.6037/-58.3816"
    );
  });

  it("creates an encoded walking route link when origin is provided", () => {
    const link = createMapLink(resource, { lat: -34.6083, lng: -58.3712 });

    expect(link).toBe(
      "https://www.openstreetmap.org/directions?engine=fossgis_osrm_foot&route=-34.6083%2C-58.3712%3B-34.6037%2C-58.3816"
    );
  });
});
