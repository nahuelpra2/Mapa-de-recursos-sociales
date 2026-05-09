import { describe, expect, it } from "vitest";
import {
  formatMissingSeedEnvMessage,
  mapResourceToSupabaseSeedRow,
  mapResourcesToSupabaseSeedRows
} from "./resourceSeedMapper.mjs";

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
  verification: {
    status: "verified",
    verifiedAt: "2026-05-01",
    source: "Fixture de test",
    notes: "Verificado"
  },
  maintenance: {
    owner: "Equipo social",
    reviewBy: "2026-06-01",
    notes: "Revisión mensual"
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
      es_centro_referencia: true,
      observaciones: "Dato de prueba",
      fuente: "Fixture de test",
      ultima_actualizacion: "2026-05-01",
      verification_status: "verified",
      verification_verified_at: "2026-05-01",
      verification_source: "Fixture de test",
      verification_notes: "Verificado",
      maintenance_owner: "Equipo social",
      maintenance_review_by: "2026-06-01",
      maintenance_notes: "Revisión mensual",
      estado: "activo",
      deleted_at: null
    });
  });

  it("uses null for optional SQL columns that are absent locally", () => {
    const resourceWithoutOptionalText = omitOptionalTextFields(resource);
    const withoutOptionalNestedText = {
      ...resourceWithoutOptionalText,
      verification: {
        status: "needs_review",
        source: "Pendiente de verificación humana"
      },
      maintenance: {
        owner: "Equipo social",
        reviewBy: "2026-06-01"
      }
    };

    expect(mapResourceToSupabaseSeedRow(withoutOptionalNestedText)).toMatchObject({
      barrio: null,
      telefono: null,
      horario: null,
      observaciones: null,
      verification_verified_at: null,
      verification_notes: null,
      maintenance_notes: null
    });
  });

  it("preserves deterministic JSON order for repeatable upserts", () => {
    expect(
      mapResourcesToSupabaseSeedRows([
        { ...resource, id: "b", nombre: "B" },
        { ...resource, id: "a", nombre: "A" }
      ]).map((row) => row.id)
    ).toEqual(["b", "a"]);
  });

  it("documents local-only Supabase seed environment variables without VITE prefixes", () => {
    expect(formatMissingSeedEnvMessage()).toContain("SUPABASE_URL");
    expect(formatMissingSeedEnvMessage()).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(formatMissingSeedEnvMessage()).not.toContain("VITE_SUPABASE_SERVICE_ROLE_KEY");
  });
});
