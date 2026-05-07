import { describe, expect, it } from "vitest";
import type { FiltersState, Resource, SearchOrigin } from "../types/resource";
import { createResource } from "../test/fixtures/resources";
import { filterResources } from "./useFilteredResources";

const defaultFilters: FiltersState = {
  tipo: "",
  poblacion: "",
  abiertoAhora: false,
  requiereDerivacion: false,
  accesoDirecto: false
};

const resources: Resource[] = [
  createResource({
    id: "day-center",
    nombre: "Centro Ñandú",
    tipo: "Centro diurno",
    direccion: "Av. Siempre Viva 123",
    lat: -34.6037,
    lng: -58.3816,
    horario: "24 horas",
    poblacion: ["Personas adultas", "Familias"],
    observaciones: "Entrega alimentos calientes",
    accesoDirecto: true
  }),
  createResource({
    id: "shelter",
    nombre: "Albergue Sur",
    tipo: "Refugio nocturno",
    direccion: "Calle Sur 456",
    lat: -34.6137,
    lng: -58.3816,
    horario: undefined,
    poblacion: ["Personas adultas"],
    requiereDerivacion: true,
    accesoDirecto: false
  }),
  createResource({
    id: "care-center",
    nombre: "Beta Atencion",
    tipo: "Centro de atención",
    direccion: "Calle Norte 789",
    lat: -34.6537,
    lng: -58.3816,
    horario: "Lunes a viernes de 9:00 a 17:00",
    poblacion: ["Niñas, niños y adolescentes"],
    observaciones: "Orientacion para adolescencias",
    accesoDirecto: true
  })
];

function filter(overrides: Partial<{ search: string; filters: FiltersState; origin: SearchOrigin | null }> = {}) {
  return filterResources({
    resources,
    search: overrides.search ?? "",
    filters: overrides.filters ?? defaultFilters,
    origin: overrides.origin ?? null
  });
}

describe("resource filtering", () => {
  it("matches text search across normalized resource fields", () => {
    expect(filter({ search: "nandu" }).map((resource) => resource.id)).toEqual(["day-center"]);
    expect(filter({ search: "alimentos calientes" }).map((resource) => resource.id)).toEqual(["day-center"]);
  });

  it("filters by resource type and served population", () => {
    const result = filter({
      filters: {
        ...defaultFilters,
        tipo: "Centro de atención",
        poblacion: "Niñas, niños y adolescentes"
      }
    });

    expect(result.map((resource) => resource.id)).toEqual(["care-center"]);
  });

  it("combines search with access and referral filters", () => {
    const directAccessResult = filter({
      search: "centro",
      filters: {
        ...defaultFilters,
        accesoDirecto: true
      }
    });

    const referralResult = filter({
      filters: {
        ...defaultFilters,
        requiereDerivacion: true
      }
    });

    expect(directAccessResult.map((resource) => resource.id)).toEqual(["care-center", "day-center"]);
    expect(referralResult.map((resource) => resource.id)).toEqual(["shelter"]);
  });

  it("filters resources open now using explicit 24-hour schedules", () => {
    const result = filter({
      filters: {
        ...defaultFilters,
        abiertoAhora: true
      }
    });

    expect(result.map((resource) => resource.id)).toEqual(["day-center"]);
  });

  it("sorts alphabetically when no valid origin is selected", () => {
    expect(filter().map((resource) => resource.id)).toEqual(["shelter", "care-center", "day-center"]);

    const resultWithInvalidOrigin = filter({
      origin: {
        lat: Number.NaN,
        lng: -58.3816,
        label: "Origen invalido",
        mode: "reference-center"
      }
    });

    expect(resultWithInvalidOrigin.map((resource) => resource.distanceKm)).toEqual([undefined, undefined, undefined]);
    expect(resultWithInvalidOrigin.map((resource) => resource.id)).toEqual(["shelter", "care-center", "day-center"]);
  });

  it("calculates distance and sorts nearest resources first for a valid origin", () => {
    const result = filter({
      origin: {
        lat: -34.6037,
        lng: -58.3816,
        label: "Obelisco",
        mode: "reference-center"
      }
    });

    expect(result.map((resource) => resource.id)).toEqual(["day-center", "shelter", "care-center"]);
    expect(result[0].distanceKm).toBeCloseTo(0, 6);
    expect(result[1].distanceKm).toBeGreaterThan(0);
  });
});
