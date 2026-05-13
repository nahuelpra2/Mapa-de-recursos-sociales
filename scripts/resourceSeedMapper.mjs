function optionalTextToSql(value) {
  const normalizedValue = typeof value === "string" ? value.trim() : value;

  return normalizedValue || null;
}

const DEFAULT_REAL_DATA_IMPORT_DATE = "2026-05-13";
const DEFAULT_REAL_DATA_REVIEW_BY = "2026-06-13";

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function createRawResourceId(resource, index) {
  const suffix = typeof index === "number" ? `-${String(index + 1).padStart(3, "0")}` : "";

  return `recurso-real-${slugify(resource.centro)}${suffix}`;
}

function isSupabaseContractResource(resource) {
  return Boolean(resource?.id && resource?.nombre && resource?.verification && resource?.maintenance);
}

function isGeocodedResource(resource) {
  return Boolean(resource?.seccion && resource?.centro && resource?.direccion && resource?.geocoding);
}

function mapGeocodedResourceToSupabaseSeedRow(resource, index) {
  return {
    id: createRawResourceId(resource, index),
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
    id: resource.id,
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
