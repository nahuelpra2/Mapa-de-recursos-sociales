import { createHash } from "node:crypto";

function optionalTextToSql(value) {
  const normalizedValue = typeof value === "string" ? value.trim() : value;

  return normalizedValue || null;
}

const DEFAULT_REAL_DATA_IMPORT_DATE = "2026-05-13";
const DEFAULT_REAL_DATA_REVIEW_BY = "2026-06-13";
const RESOURCE_UUID_NAMESPACE = "mapa-recursos-sociales/resources/v1";

function createDeterministicUuid(value) {
  const hash = createHash("sha1").update(`${RESOURCE_UUID_NAMESPACE}:${value}`).digest();

  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;

  const hex = hash.subarray(0, 16).toString("hex");

  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-");
}

function inferResourceType(section) {
  if (section.includes("Puertas Abiertas")) return "Puerta abierta";
  if (section.includes("Nocturno") || section.includes("Plan Nacional Invierno")) {
    return "Refugio nocturno";
  }

  return "Otro";
}

function inferPopulation(section) {
  if (section.includes("Hombres")) return ["Hombres", "Adultos"];
  if (section.includes("Mujeres")) return ["Mujeres", "Adultos"];
  if (section.includes("Mixto")) return ["Hombres", "Mujeres", "Adultos"];

  return ["Adultos"];
}

function formatRawResourceNotes(resource) {
  const notes = [`Sección original: ${resource.seccion}.`];
  const contact = optionalTextToSql(resource.contacto);

  if (contact) notes.push(`Contacto informado: ${contact}.`);

  return notes.join(" ");
}

function createResourceSeedId(resource, index) {
  const suffix = typeof index === "number" ? `-${String(index + 1).padStart(3, "0")}` : "";
  const stableKey = isGeocodedResource(resource)
    ? `${resource.centro}|${resource.direccion}|${resource.seccion}${suffix}`
    : `${resource.id}${suffix}`;

  return createDeterministicUuid(stableKey);
}

function isSupabaseContractResource(resource) {
  return Boolean(resource?.id && resource?.nombre && resource?.verification && resource?.maintenance);
}

function isGeocodedResource(resource) {
  return Boolean(resource?.seccion && resource?.centro && resource?.direccion && resource?.geocoding);
}

function mapGeocodedResourceToSupabaseSeedRow(resource, index) {
  return {
    id: createResourceSeedId(resource, index),
    nombre: resource.centro,
    tipo: inferResourceType(resource.seccion),
    direccion: resource.direccion,
    barrio: optionalTextToSql(resource.barrio),
    lat: resource.lat,
    lng: resource.lng,
    telefono: null,
    horario: resource.seccion.includes("Nocturno") ? "Horario nocturno; confirmar antes de concurrir" : null,
    poblacion: inferPopulation(resource.seccion),
    es_centro_referencia: false,
    observaciones: formatRawResourceNotes(resource),
    fuente: "Dataset local geocodificado desde recursos-geocoded.json",
    ultima_actualizacion: DEFAULT_REAL_DATA_IMPORT_DATE,
    verification_status: "needs_review",
    verification_verified_at: null,
    verification_source: "Importación local pendiente de verificación humana",
    verification_notes: `Geocoding ${resource.geocoding.status} via ${resource.geocoding.source}; validar datos operativos antes de publicar.`,
    maintenance_owner: "Equipo del proyecto - datos reales",
    maintenance_review_by: DEFAULT_REAL_DATA_REVIEW_BY,
    maintenance_notes: "Revisar fuente, horarios, población atendida y contacto antes de usar para derivaciones.",
    estado: "activo",
    deleted_at: null
  };
}

export function mapResourceToSupabaseSeedRow(resource, index) {
  if (isGeocodedResource(resource) && !isSupabaseContractResource(resource)) {
    return mapGeocodedResourceToSupabaseSeedRow(resource, index);
  }

  return {
    id: createResourceSeedId(resource, index),
    nombre: resource.nombre,
    tipo: resource.tipo,
    direccion: resource.direccion,
    barrio: optionalTextToSql(resource.barrio),
    lat: resource.lat,
    lng: resource.lng,
    telefono: optionalTextToSql(resource.telefono),
    horario: optionalTextToSql(resource.horario),
    poblacion: resource.poblacion,
    es_centro_referencia: resource.esCentroReferencia,
    observaciones: optionalTextToSql(resource.observaciones),
    fuente: resource.fuente,
    ultima_actualizacion: resource.ultimaActualizacion,
    verification_status: resource.verification.status,
    verification_verified_at: optionalTextToSql(resource.verification.verifiedAt),
    verification_source: resource.verification.source,
    verification_notes: optionalTextToSql(resource.verification.notes),
    maintenance_owner: resource.maintenance.owner,
    maintenance_review_by: resource.maintenance.reviewBy,
    maintenance_notes: optionalTextToSql(resource.maintenance.notes),
    estado: "activo",
    deleted_at: null
  };
}

export function mapResourcesToSupabaseSeedRows(resources) {
  return resources.map((resource, index) => mapResourceToSupabaseSeedRow(resource, index));
}

export function formatMissingSeedEnvMessage() {
  return [
    "Missing Supabase seed environment variables.",
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your local shell, not in client-side VITE_* env files.",
    "Example: SUPABASE_URL=https://<project-ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<local-secret> npm run seed:resources",
    "Use -- --dry-run to validate the transform without connecting to Supabase."
  ].join("\n");
}
