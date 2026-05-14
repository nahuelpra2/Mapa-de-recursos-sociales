import { z } from "zod";
import { resourceModalidadSchema, resourceSchema } from "./resourceSchema";
import type { Resource } from "../types/resource";

type NullableText = string | null;

export type AdminResourceStatus = "activo" | "inactivo";

export type AdminResource = Resource & {
  estado: AdminResourceStatus;
  deletedAt: NullableText;
  createdAt: string;
  updatedAt: string;
};

export type AdminResourceRow = {
  id: string;
  nombre: string;
  tipo: string;
  modalidad: string | null;
  direccion: string;
  barrio: NullableText;
  lat: number;
  lng: number;
  telefono: NullableText;
  horario: NullableText;
  poblacion: string[];
  es_centro_referencia: boolean;
  observaciones: NullableText;
  fuente: string;
  ultima_actualizacion: string;
  maintenance_review_by: string;
  estado: AdminResourceStatus;
  deleted_at: NullableText;
  created_at: string;
  updated_at: string;
};

export type AdminResourcePayload = {
  nombre: string;
  tipo: string;
  modalidad: string;
  direccion: string;
  barrio: NullableText;
  lat: number;
  lng: number;
  telefono: NullableText;
  horario: NullableText;
  poblacion: string[];
  es_centro_referencia: boolean;
  observaciones: NullableText;
  fuente: string;
  ultima_actualizacion: string;
  maintenance_review_by: string;
  estado: AdminResourceStatus;
};

export type AdminResourceArchivePayload = {
  estado: "inactivo";
  deleted_at: string;
};

const optionalBlankTextSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional()
);

export const adminResourceDraftSchema = resourceSchema.omit({ id: true }).extend({
  modalidad: resourceModalidadSchema,
  barrio: optionalBlankTextSchema,
  telefono: optionalBlankTextSchema,
  horario: optionalBlankTextSchema,
  observaciones: optionalBlankTextSchema,
  maintenance: resourceSchema.shape.maintenance
}).strict();

export type AdminResourceDraft = z.infer<typeof adminResourceDraftSchema>;

function optionalTextFromSql(value: NullableText): string | undefined {
  return value ?? undefined;
}

function optionalTextToSql(value: string | undefined): NullableText {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

export function validateAdminResourceDraft(input: unknown): AdminResourceDraft {
  return adminResourceDraftSchema.parse(input);
}

export function toAdminResourcePayload(input: AdminResourceDraft): AdminResourcePayload {
  const draft = validateAdminResourceDraft(input);

  return {
    nombre: draft.nombre,
    tipo: draft.tipo,
    modalidad: draft.modalidad,
    direccion: draft.direccion,
    barrio: optionalTextToSql(draft.barrio),
    lat: draft.lat,
    lng: draft.lng,
    telefono: optionalTextToSql(draft.telefono),
    horario: optionalTextToSql(draft.horario),
    poblacion: draft.poblacion,
    es_centro_referencia: draft.esCentroReferencia,
    observaciones: optionalTextToSql(draft.observaciones),
    fuente: draft.fuente,
    ultima_actualizacion: draft.ultimaActualizacion,
    maintenance_review_by: draft.maintenance.reviewBy,
    estado: "activo"
  };
}

export function toAdminResourceArchivePayload(deletedAt: string): AdminResourceArchivePayload {
  return {
    estado: "inactivo",
    deleted_at: deletedAt
  };
}

export function mapAdminResourceRow(row: AdminResourceRow): AdminResource {
  const resource = resourceSchema.parse({
    id: row.id,
    nombre: row.nombre,
    tipo: row.tipo,
    modalidad: optionalTextFromSql(row.modalidad),
    direccion: row.direccion,
    barrio: optionalTextFromSql(row.barrio),
    lat: row.lat,
    lng: row.lng,
    telefono: optionalTextFromSql(row.telefono),
    horario: optionalTextFromSql(row.horario),
    poblacion: row.poblacion,
    esCentroReferencia: row.es_centro_referencia,
    observaciones: optionalTextFromSql(row.observaciones),
    fuente: row.fuente,
    ultimaActualizacion: row.ultima_actualizacion,
    maintenance: {
      reviewBy: row.maintenance_review_by
    }
  });

  return {
    ...resource,
    estado: row.estado,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toAdminResourceDraft(resource: AdminResource): AdminResourceDraft {
  return validateAdminResourceDraft({
    nombre: resource.nombre,
    tipo: resource.tipo,
    modalidad: resource.modalidad ?? "",
    direccion: resource.direccion,
    barrio: resource.barrio,
    lat: resource.lat,
    lng: resource.lng,
    telefono: resource.telefono,
    horario: resource.horario,
    poblacion: resource.poblacion,
    esCentroReferencia: resource.esCentroReferencia,
    observaciones: resource.observaciones,
    fuente: resource.fuente,
    ultimaActualizacion: resource.ultimaActualizacion,
    maintenance: resource.maintenance
  });
}
