import { useMemo } from "react";
import type { FiltersState, Resource, ResourceWithDistance, SearchOrigin } from "../types/resource";
import { calculateDistanceKm } from "../utils/distance";
import { hasValidCoordinates } from "../utils/coordinates";
import { isOpenNow } from "../utils/openingHours";

type UseFilteredResourcesArgs = {
  resources: Resource[];
  search: string;
  filters: FiltersState;
  origin: SearchOrigin | null;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function matchesSearch(resource: Resource, search: string) {
  const query = normalize(search);
  if (!query) return true;

  const searchableText = normalize(
    [
      resource.nombre,
      resource.tipo,
      resource.direccion,
      resource.barrio,
      resource.telefono,
      resource.horario,
      resource.poblacion.join(" "),
      resource.observaciones
    ]
      .filter(Boolean)
      .join(" ")
  );

  return searchableText.includes(query);
}

export function useFilteredResources({ resources, search, filters, origin }: UseFilteredResourcesArgs) {
  return useMemo<ResourceWithDistance[]>(() => {
    const safeOrigin = hasValidCoordinates(origin) ? origin : null;

    return resources
      .filter((resource) => matchesSearch(resource, search))
      .filter((resource) => !filters.tipo || resource.tipo === filters.tipo)
      .filter((resource) => !filters.poblacion || resource.poblacion.includes(filters.poblacion))
      .filter((resource) => !filters.abiertoAhora || isOpenNow(resource.horario))
      .filter((resource) => !filters.requiereDerivacion || resource.requiereDerivacion)
      .filter((resource) => !filters.accesoDirecto || resource.accesoDirecto)
      .map((resource) => ({
        ...resource,
        distanceKm: safeOrigin
          ? calculateDistanceKm({ lat: safeOrigin.lat, lng: safeOrigin.lng }, { lat: resource.lat, lng: resource.lng })
          : undefined
      }))
      .sort((a, b) => {
        if (a.distanceKm === undefined && b.distanceKm === undefined) return a.nombre.localeCompare(b.nombre);
        if (a.distanceKm === undefined) return 1;
        if (b.distanceKm === undefined) return -1;
        return a.distanceKm - b.distanceKm;
      });
  }, [filters, origin, resources, search]);
}
