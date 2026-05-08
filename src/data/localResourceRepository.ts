import { resources } from "./resources";
import { getPopulationOptions, getReferenceCenters, type ResourceRepository } from "../domain/resources/resourceRepository";

export const localResourceRepository: ResourceRepository = {
  listResources: () => resources,
  listReferenceCenters: () => getReferenceCenters(resources),
  listPopulationOptions: () => getPopulationOptions(resources)
};
