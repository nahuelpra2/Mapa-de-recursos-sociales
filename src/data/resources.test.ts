import { describe, expect, it } from "vitest";
import resourcesData from "./resources.json";
import { createResource } from "../test/fixtures/resources";
import { resources } from "./resources";
import {
  ResourceDataValidationError,
  formatResourceDataValidationError,
  resourcesSchema,
  validateResources
} from "./resourceSchema";

const validResource = createResource({
  id: "recurso-valido-001",
  nombre: "Recurso válido",
  tipo: "Refugio nocturno",
  direccion: "Calle Test 123",
  barrio: "Centro",
  lat: -34.905,
  lng: -56.185,
  telefono: "0000 0000",
  horario: "24 horas",
  poblacion: ["Adultos"],
  observaciones: "Dato de prueba",
  fuente: "Fuente de prueba",
  maintenance: {
    reviewBy: "2026-06-01"
  }
});

describe("resources runtime validation", () => {
  it("accepts the current resources JSON at the data boundary", () => {
    expect(validateResources(resourcesData)).toEqual(resources);
    expect(resources).toHaveLength(resourcesData.length);
  });

  it("rejects resources with invalid geographic coordinates", () => {
    expect(() => validateResources([{ ...validResource, lat: -91 }])).toThrow(ResourceDataValidationError);
    expect(() => validateResources([{ ...validResource, lng: 181 }])).toThrow(ResourceDataValidationError);
  });

  it("rejects resources missing required fields", () => {
    const withoutName: Partial<typeof validResource> = { ...validResource };
    delete withoutName.nombre;

    expect(() => validateResources([withoutName])).toThrow(ResourceDataValidationError);
  });

  it("accepts resources with a required reference-center flag and without legacy access flags", () => {
    expect(validateResources([validResource])).toEqual([validResource]);
  });

  it("rejects resources missing the required reference-center flag", () => {
    const withoutReferenceCenterFlag: Partial<typeof validResource> = { ...validResource };
    delete withoutReferenceCenterFlag.esCentroReferencia;

    expect(() => validateResources([withoutReferenceCenterFlag])).toThrow(ResourceDataValidationError);
  });

  it("rejects unsupported access metadata at the data boundary", () => {
    expect(() =>
      validateResources([
        {
          ...validResource,
          legacyAccessFlag: true,
          legacyDirectAccessFlag: false
        }
      ])
    ).toThrow(ResourceDataValidationError);
  });

  it("rejects impossible calendar dates for last update metadata", () => {
    expect(() =>
      validateResources([{ ...validResource, ultimaActualizacion: "2026-02-30" }])
    ).toThrow(ResourceDataValidationError);

    expect(() =>
      validateResources([{ ...validResource, ultimaActualizacion: "2026-13-01" }])
    ).toThrow(ResourceDataValidationError);
  });

  it("accepts resources with maintenance review deadlines", () => {
    expect(validateResources([validResource])).toEqual([validResource]);
  });

  it("rejects invalid maintenance metadata", () => {
    expect(() =>
      validateResources([
        {
          ...validResource,
          maintenance: { reviewBy: "01-06-2026" }
        }
      ])
    ).toThrow(ResourceDataValidationError);
  });

  it("rejects impossible calendar dates for maintenance metadata", () => {
    expect(() =>
      validateResources([
        {
          ...validResource,
          maintenance: { ...validResource.maintenance, reviewBy: "2026-02-30" }
        }
      ])
    ).toThrow(ResourceDataValidationError);
  });

  it("accepts real leap days and rejects non-leap February 29 dates", () => {
    expect(
      validateResources([
        {
          ...validResource,
          ultimaActualizacion: "2024-02-29",
          maintenance: { ...validResource.maintenance, reviewBy: "2024-02-29" }
        }
      ])
    ).toEqual([
      {
        ...validResource,
        ultimaActualizacion: "2024-02-29",
        maintenance: { ...validResource.maintenance, reviewBy: "2024-02-29" }
      }
    ]);

    expect(() =>
      validateResources([{ ...validResource, ultimaActualizacion: "2025-02-29" }])
    ).toThrow(ResourceDataValidationError);
  });

  it("throws an actionable domain error instead of a raw Zod error", () => {
    expect(() => validateResources([{ ...validResource, lat: -91 }])).toThrow(
      /Invalid bundled resource data: resources\.json failed validation\./
    );
    expect(() => validateResources([{ ...validResource, lat: -91 }])).toThrow(
      /resources\.json\[0\]\.lat:/
    );
    expect(() => validateResources([{ ...validResource, lat: -91 }])).toThrow(
      /the app will not render partial or unsafe resource records/
    );
  });

  it("formats all validation issues with paths into resources.json", () => {
    const invalidResources = [{ ...validResource, lat: -91, lng: 181 }];
    const result = resourcesSchema.safeParse(invalidResources);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(formatResourceDataValidationError(result.error)).toContain("resources.json[0].lat:");
      expect(formatResourceDataValidationError(result.error)).toContain("resources.json[0].lng:");
    }
  });
});

describe("resources dataset integrity", () => {
  it("keeps every bundled resource compatible with the Resource schema", () => {
    expect(validateResources(resourcesData)).toEqual(resources);
  });

  it("keeps resource IDs unique", () => {
    const ids = resources.map((resource) => resource.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps coordinates valid for every bundled resource", () => {
    for (const resource of resources) {
      expect(Number.isFinite(resource.lat)).toBe(true);
      expect(resource.lat).toBeGreaterThanOrEqual(-90);
      expect(resource.lat).toBeLessThanOrEqual(90);
      expect(Number.isFinite(resource.lng)).toBe(true);
      expect(resource.lng).toBeGreaterThanOrEqual(-180);
      expect(resource.lng).toBeLessThanOrEqual(180);
    }
  });

  it("keeps every bundled resource explicitly classified for reference-center usage", () => {
    const referenceCenters = resources.filter((resource) => resource.esCentroReferencia);

    expect(referenceCenters.map((resource) => resource.id)).toEqual([
      "ejemplo-refugio-001",
      "ejemplo-centro-diurno-002",
      "ejemplo-puerta-abierta-003",
      "ejemplo-diurno-006"
    ]);

    for (const resource of resources) {
      expect(typeof resource.esCentroReferencia).toBe("boolean");
    }
  });

  it("keeps maintenance metadata present and consistent", () => {
    for (const resource of resources) {
      expect(resource.maintenance.reviewBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
