import { z } from "zod";
import { resourceSchema } from "./resourceSchema";
import type { Resource } from "../types/resource";

type NullableText = string | null;

export type AdminResourceStatus = "activo";

export type AdminResource = Resource & {
  estado: AdminResourceStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminResourceRow = {
  id: string;
  nombre: string;
  tipo: string;
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
  verification_status: string;
  verification_verified_at: NullableText;
  verification_source: string;
  verification_notes: NullableText;
  maintenance_owner: string;
  maintenance_review_by: string;
  maintenance_notes: NullableText;
  estado: AdminResourceStatus;
  created_at: string;
  updated_at: string;
};

export type AdminResourcePayload = {
  nombre: string;
  tipo: string;
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
  verification_status: string;
  verification_verified_at: NullableText;
  verification_source: string;
  verification_notes: NullableText;
  maintenance_owner: string;
  maintenance_review_by: string;
  maintenance_notes: NullableText;
  estado: AdminResourceStatus;
};

const optionalBlankTextSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().min(1).optional()
);

export const adminResourceDraftSchema = resourceSchema.omit({ id: true }).extend({
  barrio: optionalBlankTextSchema,
  telefono: optionalBlankTextSchema,
  horario: optionalBlankTextSchema,
  observaciones: optionalBlankTextSchema,
  verification: z.discriminatedUnion("status", [
    resourceSchema.shape.verification.options[0].extend({ notes: optionalBlankTextSchema }),
    resourceSchema.shape.verification.options[1].extend({ notes: optionalBlankTextSchema })
  ]),
  maintenance: resourceSchema.shape.maintenance.extend({ notes: optionalBlankTextSchema })
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
    verification_status: draft.verification.status,
    verification_verified_at: optionalTextToSql(draft.verification.verifiedAt),
    verification_source: draft.verification.source,
    verification_notes: optionalTextToSql(draft.verification.notes),
    maintenance_owner: draft.maintenance.owner,
    maintenance_review_by: draft.maintenance.reviewBy,
    maintenance_notes: optionalTextToSql(draft.maintenance.notes),
    estado: "activo"
  };
}

export function mapAdminResourceRow(row: AdminResourceRow): AdminResource {
  const resource = resourceSchema.parse({
    id: row.id,
    nombre: row.nombre,
    tipo: row.tipo,
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
    verification: {
      status: row.verification_status,
      verifiedAt: optionalTextFromSql(row.verification_verified_at),
      source: row.verification_source,
      notes: optionalTextFromSql(row.verification_notes)
    },
    maintenance: {
      owner: row.maintenance_owner,
      reviewBy: row.maintenance_review_by,
      notes: optionalTextFromSql(row.maintenance_notes)
    }
  });

  return {
    ...resource,
    estado: row.estado,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toAdminResourceDraft(resource: AdminResource): AdminResourceDraft {
  return validateAdminResourceDraft({
    nombre: resource.nombre,
    tipo: resource.tipo,
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
    verification: resource.verification,
    maintenance: resource.maintenance
  });
}
