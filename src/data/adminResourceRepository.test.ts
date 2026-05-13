import { describe, expect, it, vi } from "vitest";
import {
  createAdminResourceRepository,
  AdminResourcePersistenceError,
  type AdminResourceClient
} from "./adminResourceRepository";
import { type AdminResourceDraft, type AdminResourceRow } from "./adminResourceSchema";

const validDraft: AdminResourceDraft = {
  nombre: "Centro admin",
  tipo: "Centro de atención",
  direccion: "Calle Admin 123",
  barrio: "Centro",
  lat: -34.905,
  lng: -56.185,
  telefono: "2400 0000",
  horario: "Lunes a viernes de 9 a 17",
  poblacion: ["Adultos"],
  esCentroReferencia: true,
  observaciones: "Ingreso por puerta lateral",
  fuente: "Equipo territorial",
  ultimaActualizacion: "2026-05-11",
  maintenance: {
    reviewBy: "2026-06-11"
  }
};

function createRow(overrides: Partial<AdminResourceRow> = {}): AdminResourceRow {
  return {
    id: "resource-1",
    nombre: "Centro admin",
    tipo: "Centro de atención",
    direccion: "Calle Admin 123",
    barrio: "Centro",
    lat: -34.905,
    lng: -56.185,
    telefono: "2400 0000",
    horario: "Lunes a viernes de 9 a 17",
    poblacion: ["Adultos"],
    es_centro_referencia: true,
    observaciones: "Ingreso por puerta lateral",
    fuente: "Equipo territorial",
    ultima_actualizacion: "2026-05-11",
    maintenance_review_by: "2026-06-11",
    estado: "activo",
    deleted_at: null,
    created_at: "2026-05-11T10:00:00Z",
    updated_at: "2026-05-11T10:30:00Z",
    ...overrides
  };
}

describe("admin resource repository", () => {
  it("lists all admin resources through Supabase without local fallback", async () => {
    const order = vi.fn().mockResolvedValue({ data: [createRow({ id: "resource-2", nombre: "B" }), createRow()], error: null });
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));
    const repository = createAdminResourceRepository({ client: { from } as AdminResourceClient });

    await expect(repository.listAll()).resolves.toEqual([
      expect.objectContaining({ id: "resource-2", nombre: "B", estado: "activo" }),
      expect.objectContaining({ id: "resource-1", nombre: "Centro admin", estado: "activo" })
    ]);
    expect(from).toHaveBeenCalledWith("resources");
    expect(select).toHaveBeenCalledWith("*");
    expect(order).toHaveBeenCalledWith("nombre", { ascending: true });
  });

  it("loads one resource by id and returns null for Supabase not-found responses", async () => {
    const single = vi
      .fn()
      .mockResolvedValueOnce({ data: createRow({ id: "resource-1" }), error: null })
      .mockResolvedValueOnce({ data: null, error: { code: "PGRST116", message: "No rows" } });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ select }));
    const repository = createAdminResourceRepository({ client: { from } as AdminResourceClient });

    await expect(repository.getById("resource-1")).resolves.toEqual(expect.objectContaining({ id: "resource-1" }));
    await expect(repository.getById("missing")).resolves.toBeNull();
    expect(eq).toHaveBeenNthCalledWith(1, "id", "resource-1");
    expect(eq).toHaveBeenNthCalledWith(2, "id", "missing");
  });

  it("creates resources with validated active payloads", async () => {
    const single = vi.fn().mockResolvedValue({ data: createRow({ id: "created" }), error: null });
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select }));
    const from = vi.fn(() => ({ insert }));
    const repository = createAdminResourceRepository({ client: { from } as AdminResourceClient });

    await expect(repository.create(validDraft)).resolves.toEqual(expect.objectContaining({ id: "created" }));
    expect(insert).toHaveBeenCalledWith([expect.objectContaining({ nombre: "Centro admin", estado: "activo" })]);
  });

  it("updates resources by id with validated active payloads", async () => {
    const single = vi.fn().mockResolvedValue({ data: createRow({ id: "updated", nombre: "Centro editado" }), error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));
    const repository = createAdminResourceRepository({ client: { from } as AdminResourceClient });

    await expect(repository.update("updated", { ...validDraft, nombre: "Centro editado" })).resolves.toEqual(
      expect.objectContaining({ id: "updated", nombre: "Centro editado" })
    );
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ nombre: "Centro editado", estado: "activo" }));
    expect(eq).toHaveBeenCalledWith("id", "updated");
  });

  it("archives resources with inactive payloads and returns the mapped archived row", async () => {
    const archivedAt = "2026-05-12T12:00:00Z";
    const single = vi.fn().mockResolvedValue({ data: createRow({ id: "archived", estado: "inactivo", deleted_at: archivedAt }), error: null });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));
    const repository = createAdminResourceRepository({ client: { from } as AdminResourceClient, now: () => archivedAt });

    await expect(repository.archive("archived")).resolves.toEqual(expect.objectContaining({ id: "archived", estado: "inactivo", deletedAt: archivedAt }));
    expect(update).toHaveBeenCalledWith({ estado: "inactivo", deleted_at: archivedAt });
    expect(eq).toHaveBeenCalledWith("id", "archived");
  });

  it("hard deletes resources through Supabase delete by id", async () => {
    const eq = vi.fn().mockResolvedValue({ data: null, error: null });
    const deleteQuery = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ delete: deleteQuery }));
    const repository = createAdminResourceRepository({ client: { from } as AdminResourceClient });

    await expect(repository.delete("resource-1")).resolves.toBeUndefined();
    expect(from).toHaveBeenCalledWith("resources");
    expect(deleteQuery).toHaveBeenCalledTimes(1);
    expect(eq).toHaveBeenCalledWith("id", "resource-1");
  });

  it("surfaces archive and delete failures safely instead of leaking RLS details", async () => {
    const archivedSingle = vi.fn().mockResolvedValue({ data: null, error: { message: "RLS: archive denied" } });
    const archivedSelect = vi.fn(() => ({ single: archivedSingle }));
    const archivedEq = vi.fn(() => ({ select: archivedSelect }));
    const archivedUpdate = vi.fn(() => ({ eq: archivedEq }));
    const deletedEq = vi.fn().mockResolvedValue({ data: null, error: { message: "RLS: delete denied" } });
    const deleteQuery = vi.fn(() => ({ eq: deletedEq }));
    const from = vi.fn(() => ({ update: archivedUpdate, delete: deleteQuery }));
    const repository = createAdminResourceRepository({ client: { from } as AdminResourceClient, now: () => "2026-05-12T12:00:00Z" });

    await expect(repository.archive("resource-1")).rejects.toThrow("No se pudo archivar recurso");
    await expect(repository.delete("resource-1")).rejects.toThrow("No se pudo eliminar recurso");
    await expect(repository.archive("resource-1")).rejects.not.toThrow("archive denied");
    await expect(repository.delete("resource-1")).rejects.not.toThrow("delete denied");
  });

  it("surfaces Supabase failures safely instead of falling back to local data", async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: { message: "RLS: sensitive internal detail" } });
    const select = vi.fn(() => ({ order }));
    const from = vi.fn(() => ({ select }));
    const repository = createAdminResourceRepository({ client: { from } as AdminResourceClient });

    await expect(repository.listAll()).rejects.toThrow(AdminResourcePersistenceError);
    await expect(repository.listAll()).rejects.toThrow("No se pudo cargar recursos");
    await expect(repository.listAll()).rejects.not.toThrow("sensitive internal detail");
  });

  it("fails when the anon Supabase client is unavailable instead of using bundled resources", async () => {
    const repository = createAdminResourceRepository({ client: null });

    await expect(repository.listAll()).rejects.toThrow("No se pudo cargar recursos");
    await expect(repository.create(validDraft)).rejects.toThrow("No se pudo crear recurso");
  });
});
