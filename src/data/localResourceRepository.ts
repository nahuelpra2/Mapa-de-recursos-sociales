import { resources } from "./resources";
import type { ResourceRepository } from "../domain/resources/resourceRepository";

export const localResourceRepository: ResourceRepository = {
  listResources: () => resources,
  listReferenceCenters: () => resources.filter((resource) => resource.esCentroReferencia),
  listPopulationOptions: () =>
    Array.from(new Set(resources.flatMap((resource) => resource.poblacion))).sort((a, b) => a.localeCompare(b))
};
