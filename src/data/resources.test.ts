import { describe, expect, it } from "vitest";
import resourcesData from "./resources.json";
import { resources } from "./resources";
import {
  ResourceDataValidationError,
  formatResourceDataValidationError,
  resourcesSchema,
  validateResources
} from "./resourceSchema";

const validResource = {
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
  requiereDerivacion: false,
  accesoDirecto: true,
  observaciones: "Dato de prueba",
  fuente: "Fuente de prueba",
  ultimaActualizacion: "2026-05-01",
  esCentroReferencia: true
};

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
