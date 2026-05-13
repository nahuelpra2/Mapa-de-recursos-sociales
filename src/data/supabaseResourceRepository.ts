import type { AsyncResourceRepository, ResourceRepository } from "../domain/resources/resourceRepository";
import { getPopulationOptions, getReferenceCenters, toAsyncResourceRepository } from "../domain/resources/resourceRepository";
import { resourceSchema } from "./resourceSchema";
import { localResourceRepository } from "./localResourceRepository";
import { supabase } from "../lib/supabaseClient";
import type { Resource } from "../types/resource";

type NullableText = string | null;

export type SupabaseResourceRow = {
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
  maintenance_review_by: string;
};

type SupabaseResourceQuery = {
  order: (column: string, options: { ascending: boolean }) => Promise<{ data: SupabaseResourceRow[] | null; error: unknown }>;
};

export type SupabaseResourceClient = {
  from: (table: "resources") => {
    select: (columns: "*") => SupabaseResourceQuery;
  };
};

type SupabaseResourceRepositoryOptions = {
  client?: SupabaseResourceClient | null;
  fallbackRepository?: ResourceRepository;
};

function optionalText(value: NullableText): string | undefined {
  return value ?? undefined;
}

export function mapSupabaseResourceRow(row: SupabaseResourceRow): Resource {
  return resourceSchema.parse({
    id: row.id,
    nombre: row.nombre,
    tipo: row.tipo,
    direccion: row.direccion,
    barrio: optionalText(row.barrio),
    lat: row.lat,
    lng: row.lng,
    telefono: optionalText(row.telefono),
    horario: optionalText(row.horario),
    poblacion: row.poblacion,
    esCentroReferencia: row.es_centro_referencia,
    observaciones: optionalText(row.observaciones),
    fuente: row.fuente,
    ultimaActualizacion: row.ultima_actualizacion,
    maintenance: {
      reviewBy: row.maintenance_review_by
    }
  });
}

export function createSupabaseResourceRepository({
  client = supabase as SupabaseResourceClient | null,
  fallbackRepository = localResourceRepository
}: SupabaseResourceRepositoryOptions = {}): AsyncResourceRepository {
  const fallback = toAsyncResourceRepository(fallbackRepository);

  async function listResources(): Promise<Resource[]> {
    if (!client) return fallback.listResources();

    try {
      const { data, error } = await client.from("resources").select("*").order("nombre", { ascending: true });

      if (error || !data) return fallback.listResources();

      return data.map(mapSupabaseResourceRow);
    } catch {
      return fallback.listResources();
    }
  }

  return {
    listResources,
    listReferenceCenters: async () => getReferenceCenters(await listResources()),
    listPopulationOptions: async () => getPopulationOptions(await listResources())
  };
}

export const supabaseResourceRepository = createSupabaseResourceRepository();
