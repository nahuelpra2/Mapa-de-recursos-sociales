function optionalTextToSql(value) {
  return value ?? null;
}

export function mapResourceToSupabaseSeedRow(resource) {
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
  return resources.map(mapResourceToSupabaseSeedRow);
}

export function formatMissingSeedEnvMessage() {
  return [
    "Missing Supabase seed environment variables.",
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your local shell, not in client-side VITE_* env files.",
    "Example: SUPABASE_URL=https://<project-ref>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<local-secret> npm run seed:resources",
    "Use -- --dry-run to validate the transform without connecting to Supabase."
  ].join("\n");
}
