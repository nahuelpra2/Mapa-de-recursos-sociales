import { supabase } from "../lib/supabaseClient";
import type { AdminResourceRepository } from "../domain/resources/adminResourceRepository";
import {
  mapAdminResourceRow,
  toAdminResourceArchivePayload,
  toAdminResourcePayload,
  type AdminResource,
  type AdminResourceDraft,
  type AdminResourceArchivePayload,
  type AdminResourcePayload,
  type AdminResourceRow
} from "./adminResourceSchema";

type SupabaseResult<T> = Promise<{ data: T | null; error: unknown }>;

type AdminResourceSelectQuery = {
  order: (column: string, options: { ascending: boolean }) => SupabaseResult<AdminResourceRow[]>;
  eq: (column: string, value: string) => { single: () => SupabaseResult<AdminResourceRow> };
};

type AdminResourceMutationQuery = {
  select: (columns: "*") => { single: () => SupabaseResult<AdminResourceRow> };
};

type AdminResourceUpdateQuery = {
  eq: (column: string, value: string) => AdminResourceMutationQuery;
};

type AdminResourceDeleteQuery = {
  eq: (column: string, value: string) => SupabaseResult<null>;
};

export type AdminResourceClient = {
  from: (table: "resources") => {
    select: (columns: "*") => AdminResourceSelectQuery;
    insert: (payload: AdminResourcePayload[]) => AdminResourceMutationQuery;
    update: (payload: AdminResourcePayload | AdminResourceArchivePayload) => AdminResourceUpdateQuery;
    delete: () => AdminResourceDeleteQuery;
  };
};

type AdminResourceRepositoryOptions = {
  client?: AdminResourceClient | null;
  now?: () => string;
};

type Operation = "cargar recursos" | "cargar recurso" | "crear recurso" | "actualizar recurso" | "archivar recurso" | "eliminar recurso";

export class AdminResourcePersistenceError extends Error {
  readonly cause?: unknown;

  constructor(operation: Operation, cause?: unknown) {
    super(`No se pudo ${operation}. Intentá nuevamente o verificá permisos de administrador.`);
    this.name = "AdminResourcePersistenceError";
    this.cause = cause;
  }
}

function ensureClient(client: AdminResourceClient | null, operation: Operation): AdminResourceClient {
  if (!client) throw new AdminResourcePersistenceError(operation);

  return client;
}

function isNotFoundError(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "PGRST116");
}

function ensureData<T>(operation: Operation, data: T | null, error: unknown): T {
  if (error || data === null) throw new AdminResourcePersistenceError(operation, error);

  return data;
}

function ensureSuccess(operation: Operation, error: unknown): void {
  if (error) throw new AdminResourcePersistenceError(operation, error);
}

export function createAdminResourceRepository({
  client = supabase as AdminResourceClient | null,
  now = () => new Date().toISOString()
}: AdminResourceRepositoryOptions = {}): AdminResourceRepository {
  return {
    async listAll(): Promise<AdminResource[]> {
      const adminClient = ensureClient(client, "cargar recursos");
      const { data, error } = await adminClient.from("resources").select("*").order("nombre", { ascending: true });

      return ensureData("cargar recursos", data, error).map(mapAdminResourceRow);
    },

    async getById(id: string): Promise<AdminResource | null> {
      const adminClient = ensureClient(client, "cargar recurso");
      const { data, error } = await adminClient.from("resources").select("*").eq("id", id).single();

      if (isNotFoundError(error)) return null;

      return mapAdminResourceRow(ensureData("cargar recurso", data, error));
    },

    async create(input: AdminResourceDraft): Promise<AdminResource> {
      const adminClient = ensureClient(client, "crear recurso");
      const payload = toAdminResourcePayload(input);
      const { data, error } = await adminClient.from("resources").insert([payload]).select("*").single();

      return mapAdminResourceRow(ensureData("crear recurso", data, error));
    },

    async update(id: string, input: AdminResourceDraft): Promise<AdminResource> {
      const adminClient = ensureClient(client, "actualizar recurso");
      const payload = toAdminResourcePayload(input);
      const { data, error } = await adminClient.from("resources").update(payload).eq("id", id).select("*").single();

      return mapAdminResourceRow(ensureData("actualizar recurso", data, error));
    },

    async archive(id: string): Promise<AdminResource> {
      const adminClient = ensureClient(client, "archivar recurso");
      const payload = toAdminResourceArchivePayload(now());
      const { data, error } = await adminClient.from("resources").update(payload).eq("id", id).select("*").single();

      return mapAdminResourceRow(ensureData("archivar recurso", data, error));
    },

    async delete(id: string): Promise<void> {
      const adminClient = ensureClient(client, "eliminar recurso");
      const { error } = await adminClient.from("resources").delete().eq("id", id);

      ensureSuccess("eliminar recurso", error);
    }
  };
}

export const adminResourceRepository = createAdminResourceRepository();
