import { describe, expect, it, vi } from "vitest";
import { createResource } from "../test/fixtures/resources";
import {
  createSupabaseResourceRepository,
  mapSupabaseResourceRow,
  type SupabaseResourceRow
} from "./supabaseResourceRepository";

const fallbackResource = createResource({
  id: "fallback-resource",
  nombre: "Recurso local fallback",
  poblacion: ["Adultos", "Mujeres"],
  esCentroReferencia: true
});

function createRow(overrides: Partial<SupabaseResourceRow> = {}): SupabaseResourceRow {
  return {
    id: "supabase-resource",
    nombre: "Recurso Supabase",
    tipo: "Centro de atención",
    direccion: "Calle Supabase 123",
    barrio: "Centro",
    lat: -34.905,
    lng: -56.185,
    telefono: "0000 9999",
    horario: "Lunes a viernes de 9:00 a 17:00",
    poblacion: ["Adultos", "Familias"],
    es_centro_referencia: false,
    observaciones: "Dato remoto validado",
    fuente: "Supabase test",
    ultima_actualizacion: "2026-05-08",
    verification_status: "verified",
    verification_verified_at: "2026-05-08",
    verification_source: "Equipo territorial",
    verification_notes: "Verificado por teléfono",
    maintenance_owner: "Equipo social",
    maintenance_review_by: "2026-06-08",
    maintenance_notes: "Revisar mensualmente",
    ...overrides
  };
}

function createClientReturning(data: SupabaseResourceRow[] | null, error: unknown = null) {
  const order = vi.fn().mockResolvedValue({ data, error });
  const select = vi.fn(() => ({ order }));
  const from = vi.fn(() => ({ select }));

  return { client: { from }, from, select, order };
}

describe("Supabase resource repository", () => {
  it("maps SQL snake_case resource rows to the app Resource model", () => {
    expect(mapSupabaseResourceRow(createRow())).toEqual(
      createResource({
        id: "supabase-resource",
        nombre: "Recurso Supabase",
        tipo: "Centro de atención",
        direccion: "Calle Supabase 123",
        barrio: "Centro",
        lat: -34.905,
        lng: -56.185,
        telefono: "0000 9999",
        horario: "Lunes a viernes de 9:00 a 17:00",
        poblacion: ["Adultos", "Familias"],
        esCentroReferencia: false,
        observaciones: "Dato remoto validado",
        fuente: "Supabase test",
        ultimaActualizacion: "2026-05-08",
        verification: {
          status: "verified",
          verifiedAt: "2026-05-08",
          source: "Equipo territorial",
          notes: "Verificado por teléfono"
        },
        maintenance: {
          owner: "Equipo social",
          reviewBy: "2026-06-08",
          notes: "Revisar mensualmente"
        }
      })
    );
  });

  it("keeps poblacion and omits nullable optional SQL fields instead of weakening validation", () => {
    expect(
      mapSupabaseResourceRow(
        createRow({
          barrio: null,
          telefono: null,
          horario: null,
          observaciones: null,
          verification_status: "needs_review",
          verification_verified_at: null,
          verification_notes: null,
          maintenance_notes: null
        })
      )
    ).toEqual(
      createResource({
        id: "supabase-resource",
        nombre: "Recurso Supabase",
        tipo: "Centro de atención",
        direccion: "Calle Supabase 123",
        barrio: undefined,
        lat: -34.905,
        lng: -56.185,
        telefono: undefined,
        horario: undefined,
        poblacion: ["Adultos", "Familias"],
        esCentroReferencia: false,
        observaciones: undefined,
        fuente: "Supabase test",
        ultimaActualizacion: "2026-05-08",
        verification: {
          status: "needs_review",
          source: "Equipo territorial",
          notes: undefined
        },
        maintenance: {
          owner: "Equipo social",
          reviewBy: "2026-06-08",
          notes: undefined
        }
      })
    );
  });

  it("uses the local repository when the Supabase client is unavailable", async () => {
    const repository = createSupabaseResourceRepository({
      client: null,
      fallbackRepository: {
        listResources: () => [fallbackResource],
        listReferenceCenters: () => [fallbackResource],
        listPopulationOptions: () => ["Adultos", "Mujeres"]
      }
    });

    await expect(repository.listResources()).resolves.toEqual([fallbackResource]);
    await expect(repository.listReferenceCenters()).resolves.toEqual([fallbackResource]);
    await expect(repository.listPopulationOptions()).resolves.toEqual(["Adultos", "Mujeres"]);
  });

  it("falls back to local resources when the Supabase request fails", async () => {
    const { client } = createClientReturning(null, { message: "network unavailable" });
    const repository = createSupabaseResourceRepository({
      client,
      fallbackRepository: {
        listResources: () => [fallbackResource],
        listReferenceCenters: () => [fallbackResource],
        listPopulationOptions: () => ["Adultos", "Mujeres"]
      }
    });

    await expect(repository.listResources()).resolves.toEqual([fallbackResource]);
  });

  it("falls back to local resources when the Supabase request throws", async () => {
    const order = vi.fn().mockRejectedValue(new Error("fetch failed"));
    const repository = createSupabaseResourceRepository({
      client: { from: () => ({ select: () => ({ order }) }) },
      fallbackRepository: {
        listResources: () => [fallbackResource],
        listReferenceCenters: () => [fallbackResource],
        listPopulationOptions: () => ["Adultos", "Mujeres"]
      }
    });

    await expect(repository.listResources()).resolves.toEqual([fallbackResource]);
  });

  it("derives reference centers and population options from Supabase resources when the request succeeds", async () => {
    const { client, from, select, order } = createClientReturning([
      createRow({ id: "centro", nombre: "Centro", es_centro_referencia: true, poblacion: ["Mujeres", "Adultos"] }),
      createRow({ id: "no-centro", nombre: "No centro", es_centro_referencia: false, poblacion: ["Adultos"] })
    ]);
    const repository = createSupabaseResourceRepository({
      client,
      fallbackRepository: {
        listResources: () => [fallbackResource],
        listReferenceCenters: () => [fallbackResource],
        listPopulationOptions: () => ["Adultos", "Mujeres"]
      }
    });

    await expect(repository.listReferenceCenters()).resolves.toEqual([
      expect.objectContaining({ id: "centro", esCentroReferencia: true })
    ]);
    await expect(repository.listPopulationOptions()).resolves.toEqual(["Adultos", "Mujeres"]);
    expect(from).toHaveBeenCalledWith("resources");
    expect(select).toHaveBeenCalledWith("*");
    expect(order).toHaveBeenCalledWith("nombre", { ascending: true });
  });
});
