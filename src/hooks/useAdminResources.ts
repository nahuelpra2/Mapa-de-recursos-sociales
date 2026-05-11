import { useEffect, useState } from "react";
import { adminResourceRepository } from "../data/adminResourceRepository";
import type { AdminResource } from "../data/adminResourceSchema";
import type { AdminResourceRepository } from "../domain/resources/adminResourceRepository";

const ADMIN_RESOURCE_LOAD_ERROR = "No se pudieron cargar los recursos. Intentá nuevamente o verificá permisos de administrador.";

export type AdminResourcesListStatus = "loading" | "error" | "empty" | "success";

export type AdminResourcesListState = {
  status: AdminResourcesListStatus;
  resources: AdminResource[];
  error: string | null;
};

export function createAdminResourcesLoadingState(): AdminResourcesListState {
  return {
    status: "loading",
    resources: [],
    error: null
  };
}

export function resolveAdminResourcesSuccess(resources: AdminResource[]): AdminResourcesListState {
  return {
    status: resources.length > 0 ? "success" : "empty",
    resources,
    error: null
  };
}

export function resolveAdminResourcesError(previous?: AdminResourcesListState): AdminResourcesListState {
  return {
    status: "error",
    resources: previous?.resources ?? [],
    error: ADMIN_RESOURCE_LOAD_ERROR
  };
}

export function shouldShowAdminResourceRows(state: AdminResourcesListState): boolean {
  return state.status === "success" && state.resources.length > 0;
}

type UseAdminResourcesOptions = {
  repository?: Pick<AdminResourceRepository, "listAll">;
};

export function useAdminResources({ repository = adminResourceRepository }: UseAdminResourcesOptions = {}): AdminResourcesListState {
  const [state, setState] = useState<AdminResourcesListState>(() => createAdminResourcesLoadingState());

  useEffect(() => {
    let active = true;

    repository
      .listAll()
      .then((resources) => {
        if (active) setState(resolveAdminResourcesSuccess(resources));
      })
      .catch((error: unknown) => {
        if (active) setState((previous) => resolveAdminResourcesError(previous, error));
      });

    return () => {
      active = false;
    };
  }, [repository]);

  return state;
}
