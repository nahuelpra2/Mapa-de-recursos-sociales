import type { Resource } from "../../types/resource";

export type ResourceRepository = {
  listResources: () => Resource[];
  listReferenceCenters: () => Resource[];
  listPopulationOptions: () => string[];
};
