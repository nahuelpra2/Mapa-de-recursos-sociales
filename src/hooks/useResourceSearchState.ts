import { useEffect, useState } from "react";
import type { Coordinates, FiltersState, Resource, SearchOrigin } from "../types/resource";
import { hasValidCoordinates } from "../utils/coordinates";

const defaultFilters: FiltersState = {
  tipo: "",
  poblacion: "",
  abiertoAhora: false,
  requiereDerivacion: false,
  accesoDirecto: false
};

type UseResourceSearchStateArgs = {
  location: Coordinates | null;
  referenceCenters: Resource[];
};

export function useResourceSearchState({ location, referenceCenters }: UseResourceSearchStateArgs) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [origin, setOrigin] = useState<SearchOrigin | null>(null);
  const [selectedReferenceCenterId, setSelectedReferenceCenterId] = useState("");

  useEffect(() => {
    if (!hasValidCoordinates(location)) return;

    setOrigin({
      lat: location.lat,
      lng: location.lng,
      label: "tu ubicacion actual",
      mode: "current-location"
    });
    setSelectedReferenceCenterId("");
  }, [location]);

  function clearFilters() {
    setFilters(defaultFilters);
  }

  function clearReferenceCenterSelection() {
    setSelectedReferenceCenterId("");
  }

  function selectReferenceCenter(centerId: string) {
    setSelectedReferenceCenterId(centerId);

    const center = referenceCenters.find((resource) => resource.id === centerId);
    if (!center || !hasValidCoordinates(center)) {
      setOrigin(null);
      return;
    }

    setOrigin({
      lat: center.lat,
      lng: center.lng,
      label: center.nombre,
      mode: "reference-center"
    });
  }

  const originLabel = origin
    ? origin.mode === "current-location"
      ? "Mostrando recursos cercanos a tu ubicacion actual"
      : `Mostrando recursos cercanos a ${origin.label}`
    : "Selecciona tu ubicacion actual o un centro de referencia para ordenar por cercania";

  return {
    search,
    setSearch,
    filters,
    setFilters,
    clearFilters,
    origin,
    originLabel,
    selectedReferenceCenterId,
    clearReferenceCenterSelection,
    selectReferenceCenter
  };
}
