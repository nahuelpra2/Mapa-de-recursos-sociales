import type { AdminResource, AdminResourceDraft } from "../../data/adminResourceSchema";
import { createResource } from "./resources";

type AdminResourceLifecycleFixture = AdminResource & {
  estado: "activo" | "inactivo";
  deletedAt: string | null;
};

type AdminResourceLifecycleFixtureOverrides = Partial<AdminResourceLifecycleFixture>;

export function createAdminResourceDraft(overrides: Partial<AdminResourceDraft> = {}): AdminResourceDraft {
  return {
    nombre: "Centro admin",
    tipo: "Centro de atención",
    direccion: "Calle Admin 123",
    barrio: "Centro",
    lat: -34.905,
    lng: -56.185,
    telefono: "2400 0000",
    horario: "Lunes a viernes de 9 a 17",
    poblacion: ["Adultos", "Familias"],
    esCentroReferencia: false,
    observaciones: "Ingreso por puerta lateral",
    fuente: "Equipo territorial",
    ultimaActualizacion: "2026-05-11",
    verification: {
      status: "verified",
      verifiedAt: "2026-05-11",
      source: "Llamada de control",
      notes: "Confirmado"
    },
    maintenance: {
      owner: "Equipo social",
      reviewBy: "2026-06-11",
      notes: "Revisar cupos"
    },
    ...overrides
  };
}

export function createAdminResource(overrides: AdminResourceLifecycleFixtureOverrides = {}): AdminResourceLifecycleFixture {
  return {
    ...createResource(overrides),
    estado: "activo",
    deletedAt: null,
    createdAt: "2026-05-01T10:00:00Z",
    updatedAt: "2026-05-01T10:00:00Z",
    ...overrides
  };
}
