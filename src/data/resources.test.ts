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
  verification: {
    status: "verified",
    verifiedAt: "2026-05-01",
    source: "Llamada de prueba"
  },
  maintenance: {
    owner: "Equipo de prueba",
    reviewBy: "2026-06-01",
    notes: "Revisión manual programada"
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

  it("accepts resources with human verification metadata", () => {
    expect(validateResources([validResource])).toEqual([validResource]);
    expect(
      validateResources([
        {
          ...validResource,
          verification: {
            status: "needs_review",
            source: "Dato de prueba pendiente de verificación humana",
            notes: "No usar para derivaciones reales"
          }
        }
      ])
    ).toEqual([
      {
        ...validResource,
        verification: {
          status: "needs_review",
          source: "Dato de prueba pendiente de verificación humana",
          notes: "No usar para derivaciones reales"
        }
      }
    ]);
  });

  it("rejects invalid verification metadata", () => {
    expect(() =>
      validateResources([
        {
          ...validResource,
          verification: { status: "verified", source: "Llamada de prueba" }
        }
      ])
    ).toThrow(ResourceDataValidationError);

    expect(() =>
      validateResources([
        {
          ...validResource,
          verification: { status: "needs_review", source: "" }
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

  it("rejects impossible calendar dates for verification metadata", () => {
    expect(() =>
      validateResources([
        {
          ...validResource,
          verification: { ...validResource.verification, verifiedAt: "2026-02-30" }
        }
      ])
    ).toThrow(ResourceDataValidationError);

    expect(() =>
      validateResources([
        {
          ...validResource,
          verification: {
            status: "needs_review",
            verifiedAt: "2025-02-29",
            source: "Dato de prueba pendiente de verificación humana"
          }
        }
      ])
    ).toThrow(ResourceDataValidationError);
  });

  it("accepts resources with maintenance ownership and manual review deadline", () => {
    expect(validateResources([validResource])).toEqual([validResource]);
  });

  it("rejects invalid maintenance metadata", () => {
    expect(() =>
      validateResources([
        {
          ...validResource,
          maintenance: { owner: "", reviewBy: "2026-06-01" }
        }
      ])
    ).toThrow(ResourceDataValidationError);

    expect(() =>
      validateResources([
        {
          ...validResource,
          maintenance: { owner: "Equipo de prueba", reviewBy: "01-06-2026" }
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
          verification: { ...validResource.verification, verifiedAt: "2024-02-29" },
          maintenance: { ...validResource.maintenance, reviewBy: "2024-02-29" }
        }
      ])
    ).toEqual([
      {
        ...validResource,
        ultimaActualizacion: "2024-02-29",
        verification: { ...validResource.verification, verifiedAt: "2024-02-29" },
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

  it("keeps manual verification metadata present and consistent", () => {
    for (const resource of resources) {
      expect(resource.verification.source.trim()).not.toBe("");

      if (resource.verification.status === "verified") {
        expect(resource.verification.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("keeps maintenance metadata present and consistent", () => {
    for (const resource of resources) {
      expect(resource.maintenance.owner.trim()).not.toBe("");
      expect(resource.maintenance.reviewBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
