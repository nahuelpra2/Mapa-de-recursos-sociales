import resourcesData from "./resources.json";
import { validateResources } from "./resourceSchema";

export const resources = validateResources(resourcesData);
