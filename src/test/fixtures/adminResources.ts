import type { AdminResource } from "../../data/adminResourceSchema";
import { createResource } from "./resources";

export function createAdminResource(overrides: Partial<AdminResource> = {}): AdminResource {
  return {
    ...createResource(overrides),
    estado: "activo",
    createdAt: "2026-05-01T10:00:00Z",
    updatedAt: "2026-05-01T10:00:00Z",
    ...overrides
  };
}
