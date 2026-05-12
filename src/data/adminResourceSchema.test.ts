import { describe, expect, it } from "vitest";
import { createResource } from "../test/fixtures/resources";
import {
  adminResourceDraftSchema,
  mapAdminResourceRow,
  toAdminResourceArchivePayload,
  toAdminResourcePayload,
  validateAdminResourceDraft,
  type AdminResourceDraft,
  type AdminResourceRow
} from "./adminResourceSchema";

const validDraft: AdminResourceDraft = {
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
  }
};

function createRow(overrides: Partial<AdminResourceRow> = {}): AdminResourceRow {
  return {
    id: "admin-resource-1",
    nombre: "Centro admin",
    tipo: "Centro de atención",
    direccion: "Calle Admin 123",
    barrio: "Centro",
    lat: -34.905,
    lng: -56.185,
    telefono: "2400 0000",
    horario: "Lunes a viernes de 9 a 17",
    poblacion: ["Adultos", "Familias"],
    es_centro_referencia: false,
    observaciones: "Ingreso por puerta lateral",
    fuente: "Equipo territorial",
    ultima_actualizacion: "2026-05-11",
    verification_status: "verified",
    verification_verified_at: "2026-05-11",
    verification_source: "Llamada de control",
    verification_notes: "Confirmado",
    maintenance_owner: "Equipo social",
    maintenance_review_by: "2026-06-11",
    maintenance_notes: "Revisar cupos",
    estado: "activo",
    deleted_at: null,
    created_at: "2026-05-11T10:00:00Z",
    updated_at: "2026-05-11T10:30:00Z",
    ...overrides
  };
}

describe("admin resource schema helpers", () => {
  it("accepts a complete admin draft with required SQL-backed fields", () => {
    expect(validateAdminResourceDraft(validDraft)).toEqual(validDraft);
  });

  it("rejects drafts missing required SQL-backed fields before persistence", () => {
    const invalidDraft = { ...validDraft, fuente: "", poblacion: [], maintenance: { ...validDraft.maintenance, owner: "" } };

    const result = adminResourceDraftSchema.safeParse(invalidDraft);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(
        expect.arrayContaining(["fuente", "poblacion", "maintenance.owner"])
      );
    }
  });

  it("maps optional blank draft text to null and pins create/edit payloads to estado activo", () => {
    expect(
      toAdminResourcePayload({
        ...validDraft,
        barrio: "  ",
        telefono: "",
        horario: "   ",
        observaciones: "",
        verification: { ...validDraft.verification, notes: "" },
        maintenance: { ...validDraft.maintenance, notes: "" }
      })
    ).toEqual({
      nombre: "Centro admin",
      tipo: "Centro de atención",
      direccion: "Calle Admin 123",
      barrio: null,
      lat: -34.905,
      lng: -56.185,
      telefono: null,
      horario: null,
      poblacion: ["Adultos", "Familias"],
      es_centro_referencia: false,
      observaciones: null,
      fuente: "Equipo territorial",
      ultima_actualizacion: "2026-05-11",
      verification_status: "verified",
      verification_verified_at: "2026-05-11",
      verification_source: "Llamada de control",
      verification_notes: null,
      maintenance_owner: "Equipo social",
      maintenance_review_by: "2026-06-11",
      maintenance_notes: null,
      estado: "activo"
    });
  });

  it("maps SQL admin rows to resource data plus active admin metadata", () => {
    expect(mapAdminResourceRow(createRow())).toEqual({
      ...createResource(validDraft),
      id: "admin-resource-1",
      estado: "activo",
      deletedAt: null,
      createdAt: "2026-05-11T10:00:00Z",
      updatedAt: "2026-05-11T10:30:00Z"
    });
  });

  it("omits nullable SQL fields from mapped resource data without weakening required fields", () => {
    expect(
      mapAdminResourceRow(
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
    ).toEqual({
        ...createResource({
          ...validDraft,
          id: "admin-resource-1",
          barrio: undefined,
          telefono: undefined,
          horario: undefined,
          observaciones: undefined,
          verification: {
            status: "needs_review",
            verifiedAt: undefined,
            source: "Llamada de control",
            notes: undefined
          },
          maintenance: { ...validDraft.maintenance, notes: undefined }
        }),
      estado: "activo",
      deletedAt: null,
      createdAt: "2026-05-11T10:00:00Z",
      updatedAt: "2026-05-11T10:30:00Z"
    });
  });

  it("maps inactive SQL admin rows and deletion timestamps into lifecycle metadata", () => {
    expect(
      mapAdminResourceRow(
        createRow({
          estado: "inactivo",
          deleted_at: "2026-05-12T12:00:00Z"
        })
      )
    ).toEqual({
      ...createResource(validDraft),
      id: "admin-resource-1",
      estado: "inactivo",
      deletedAt: "2026-05-12T12:00:00Z",
      createdAt: "2026-05-11T10:00:00Z",
      updatedAt: "2026-05-11T10:30:00Z"
    });
  });

  it("builds archive payloads that mark the row inactive and preserve deletion timestamps", () => {
    expect(toAdminResourceArchivePayload("2026-05-12T12:00:00Z")).toEqual({
      estado: "inactivo",
      deleted_at: "2026-05-12T12:00:00Z"
    });
  });
});
