import { useEffect, useState } from "react";
import { supabaseResourceRepository } from "../data/supabaseResourceRepository";
import { getPopulationOptions, getReferenceCenters, type AsyncResourceRepository } from "../domain/resources/resourceRepository";
import type { Resource } from "../types/resource";

const PUBLIC_RESOURCES_ERROR_MESSAGE = "No se pudieron cargar los recursos. Probá nuevamente en unos minutos.";

export type PublicResourcesLoadStatus = "loading" | "ready" | "error";

export type PublicResourcesState = {
  status: PublicResourcesLoadStatus;
  resources: Resource[];
  referenceCenters: Resource[];
  populationOptions: string[];
  error: string | null;
};

export function createPublicResourcesReadyState(resources: Resource[]): PublicResourcesState {
  return {
    status: "ready",
    resources,
    referenceCenters: getReferenceCenters(resources),
    populationOptions: getPopulationOptions(resources),
    error: null
  };
}

export function resolvePublicResourcesSuccess(resources: Resource[]): PublicResourcesState {
  return createPublicResourcesReadyState(resources);
}

export function resolvePublicResourcesError(previousState?: PublicResourcesState, cause?: unknown): PublicResourcesState {
  void cause;

  return {
    status: "error",
    resources: previousState?.resources ?? [],
    referenceCenters: previousState?.referenceCenters ?? [],
    populationOptions: previousState?.populationOptions ?? [],
    error: PUBLIC_RESOURCES_ERROR_MESSAGE
  };
}

export function createPublicResourcesLoadingState(previousState?: PublicResourcesState): PublicResourcesState {
  return {
    status: "loading",
    resources: previousState?.resources ?? [],
    referenceCenters: previousState?.referenceCenters ?? [],
    populationOptions: previousState?.populationOptions ?? [],
    error: null
  };
}

export function shouldShowPublicResourceResults(status: PublicResourcesLoadStatus): boolean {
  return status !== "loading";
}

export function usePublicResources(repository: AsyncResourceRepository = supabaseResourceRepository): PublicResourcesState {
  const [state, setState] = useState<PublicResourcesState>(() => createPublicResourcesLoadingState());

  useEffect(() => {
    let isCurrent = true;

    setState((previousState) => createPublicResourcesLoadingState(previousState));

    repository
      .listResources()
      .then((resources) => {
        if (!isCurrent) return;
        setState(resolvePublicResourcesSuccess(resources));
      })
      .catch((cause: unknown) => {
        if (!isCurrent) return;
        setState((previousState) => resolvePublicResourcesError(previousState, cause));
      });

    return () => {
      isCurrent = false;
    };
  }, [repository]);

  return state;
}
