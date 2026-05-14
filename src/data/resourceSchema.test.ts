import { describe, expect, it } from "vitest";
import { createResource } from "../test/fixtures/resources";
import {
  RESOURCE_MODALIDADES,
  resourceModalidadSchema,
  resourceSchema,
  type ResourceModalidadFromSchema
} from "./resourceSchema";

describe("resource modalidad schema", () => {
  it("exports the confirmed modalidad catalog in order", () => {
    expect(RESOURCE_MODALIDADES).toEqual([
      "COLMENA - Nocturnos Hombres",
      "COLMENA - Nocturno Mixto",
      "Nocturno Hombres",
      "Nocturno Mixto",
      "Nocturno Mujeres",
      "Plan Nacional Invierno - Area Metropolitana",
      "Plan Nacional Invierno",
      "Plan Nacional Invierno - Puertas Abiertas"
    ]);
  });

  it("accepts only the approved modalidad values", () => {
    const modalidad: ResourceModalidadFromSchema = resourceModalidadSchema.parse(
      RESOURCE_MODALIDADES[0]
    );

    expect(modalidad).toBe(RESOURCE_MODALIDADES[0]);
    expect(resourceModalidadSchema.safeParse("Desconocida").success).toBe(false);
  });

  it("allows public resource records to carry an optional modalidad", () => {
    expect(
      resourceSchema.parse({
        ...createResource(),
        modalidad: RESOURCE_MODALIDADES[2]
      })
    ).toEqual(
      expect.objectContaining({
        modalidad: RESOURCE_MODALIDADES[2]
      })
    );
  });
});
