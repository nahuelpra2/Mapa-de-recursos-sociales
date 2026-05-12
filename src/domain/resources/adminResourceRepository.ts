import type { AdminResource, AdminResourceDraft } from "../../data/adminResourceSchema";

export type AdminResourceRepository = {
  listAll: () => Promise<AdminResource[]>;
  getById: (id: string) => Promise<AdminResource | null>;
  create: (input: AdminResourceDraft) => Promise<AdminResource>;
  update: (id: string, input: AdminResourceDraft) => Promise<AdminResource>;
  archive: (id: string) => Promise<AdminResource>;
  delete: (id: string) => Promise<void>;
};
