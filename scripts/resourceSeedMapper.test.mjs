import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  formatMissingSeedEnvMessage,
  mapResourceToSupabaseSeedRow,
  mapResourcesToSupabaseSeedRows
} from "./resourceSeedMapper.mjs";

const geocodedResources = JSON.parse(
  readFileSync(resolve(process.cwd(), "src", "data", "resources-geocoded.json"), "utf8")
);

const resource = {
  id: "recurso-test-001",
  nombre: "Recurso de prueba",
  tipo: "Centro de atención",
  direccion: "Calle Test 123",
  barrio: "Centro",
  lat: -34.905,
  lng: -56.185,
  telefono: "0000 0000",
  horario: "Lunes a viernes de 9:00 a 17:00",
  poblacion: ["Adultos", "Familias"],
  esCentroReferencia: true,
  observaciones: "Dato de prueba",
  fuente: "Fixture de test",
  ultimaActualizacion: "2026-05-01",
  maintenance: {
    reviewBy: "2026-06-01"
  }
};

function omitOptionalTextFields(value) {
  const copy = { ...value };
  delete copy.barrio;
  delete copy.telefono;
  delete copy.horario;
  delete copy.observaciones;
  return copy;
}

describe("resource seed mapper", () => {
  it("maps the local Resource shape to the public.resources seed row shape", () => {
    expect(mapResourceToSupabaseSeedRow(resource)).toEqual({
      id: "c1e448b0-038b-58f5-81c1-61cc9d104229",
      nombre: "Recurso de prueba",
      tipo: "Centro de atención",
      direccion: "Calle Test 123",
      barrio: "Centro",
      lat: -34.905,
      lng: -56.185,
      telefono: "0000 0000",
      horario: "Lunes a viernes de 9:00 a 17:00",
      poblacion: ["Adultos", "Familias"],
      es_centro_referencia: true,
      observaciones: "Dato de prueba",
      fuente: "Fixture de test",
      ultima_actualizacion: "2026-05-01",
      maintenance_review_by: "2026-06-01",
      estado: "activo",
      deleted_at: null
    });
  });

  it("uses null for optional SQL columns that are absent locally", () => {
    const resourceWithoutOptionalText = omitOptionalTextFields(resource);
    const withoutOptionalNestedText = {
      ...resourceWithoutOptionalText
    };

    expect(mapResourceToSupabaseSeedRow(withoutOptionalNestedText)).toMatchObject({
      barrio: null,
      telefono: null,
      horario: null,
      observaciones: null
    });
  });

  it("maps geocoded real resources to the Supabase seed row contract", () => {
    expect(mapResourceToSupabaseSeedRow(geocodedResources[0], 0)).toEqual({
      id: "7c8c16ab-4187-5b88-aa1c-8d247c3d39bd",
      nombre: "AVES DE PASO 111- Caiguá 1337",
      tipo: "Refugio nocturno",
      direccion: "Caiguá 1337 esq. Millán",
      barrio: "Atahualpa",
      lat: -34.86436485495565,
      lng: -56.19370188521929,
      telefono: null,
      horario: "Horario nocturno; confirmar antes de concurrir",
      poblacion: ["Hombres", "Adultos"],
      es_centro_referencia: false,
      observaciones: "Sección original: COLMENA - Nocturno Hombres. Contacto informado: avesdepaso111@gmail.com.",
      fuente: "Dataset local geocodificado desde recursos-geocoded.json",
      ultima_actualizacion: "2026-05-13",
      maintenance_review_by: "2026-06-13",
      estado: "activo",
      deleted_at: null
    });
  });

  it("keeps every geocoded real resource inside the allowed Supabase enum contract", () => {
    const allowedTypes = new Set([
      "Refugio nocturno",
      "Centro diurno",
      "Puerta abierta",
      "Centro de atención",
      "Otro"
    ]);

    const rows = mapResourcesToSupabaseSeedRows(geocodedResources);

    expect(rows).toHaveLength(64);
    expect(rows.every((row) => allowedTypes.has(row.tipo))).toBe(true);
    expect(rows.every((row) => row.maintenance_review_by === "2026-06-13")).toBe(true);
    expect(rows.every((row) => /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(row.id))).toBe(true);
    expect(new Set(rows.map((row) => row.id)).size).toBe(rows.length);
  });

  it("preserves deterministic UUID order for repeatable upserts", () => {
    expect(
      mapResourcesToSupabaseSeedRows([
        { ...resource, id: "b", nombre: "B" },
        { ...resource, id: "a", nombre: "A" }
      ]).map((row) => row.id)
    ).toEqual(["d26dfed8-1572-53f6-b7f1-e39ea24e7d51", "bebfc2e0-8d12-5a44-a921-1fdf99b9d607"]);
  });

  it("documents local-only Supabase seed environment variables without VITE prefixes", () => {
    expect(formatMissingSeedEnvMessage()).toContain("SUPABASE_URL");
    expect(formatMissingSeedEnvMessage()).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(formatMissingSeedEnvMessage()).not.toContain("VITE_SUPABASE_SERVICE_ROLE_KEY");
  });
});
