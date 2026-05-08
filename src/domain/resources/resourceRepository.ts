import type { Resource } from "../../types/resource";

export type ResourceRepository = {
  listResources: () => Resource[];
  listReferenceCenters: () => Resource[];
  listPopulationOptions: () => string[];
};

export type AsyncResourceRepository = {
  listResources: () => Promise<Resource[]>;
  listReferenceCenters: () => Promise<Resource[]>;
  listPopulationOptions: () => Promise<string[]>;
};

export function getReferenceCenters(resources: Resource[]): Resource[] {
  return resources.filter((resource) => resource.esCentroReferencia);
}

export function getPopulationOptions(resources: Resource[]): string[] {
  return Array.from(new Set(resources.flatMap((resource) => resource.poblacion))).sort((a, b) => a.localeCompare(b));
}

export function toAsyncResourceRepository(repository: ResourceRepository): AsyncResourceRepository {
  return {
    listResources: async () => repository.listResources(),
    listReferenceCenters: async () => repository.listReferenceCenters(),
    listPopulationOptions: async () => repository.listPopulationOptions()
  };
}
