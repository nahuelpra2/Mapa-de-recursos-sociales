import type { ResourceFromSchema, ResourceModalidadFromSchema, ResourceTypeFromSchema } from "../data/resourceSchema";

export type ResourceType = ResourceTypeFromSchema;
export type ResourceModalidad = ResourceModalidadFromSchema;

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Resource = ResourceFromSchema;

export type ResourceWithDistance = Resource & {
  distanceKm?: number;
};

export type FiltersState = {
  tipo: ResourceType | "";
  modalidad: ResourceModalidad | "";
  poblacion: string;
  abiertoAhora: boolean;
};

export type OriginMode = "current-location" | "reference-center";

export type SearchOrigin = Coordinates & {
  label: string;
  mode: OriginMode;
};
