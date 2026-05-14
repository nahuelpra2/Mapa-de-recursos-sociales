import { useEffect, useState } from "react";
import { adminResourceRepository } from "../data/adminResourceRepository";
import { RESOURCE_MODALIDADES } from "../data/resourceSchema";
import { adminResourceDraftSchema, toAdminResourceDraft, type AdminResource, type AdminResourceDraft } from "../data/adminResourceSchema";
import type { AdminResourceRepository } from "../domain/resources/adminResourceRepository";
import { appRoutes } from "../routes";

const ADMIN_RESOURCE_LOAD_ERROR = "No se pudieron cargar los recursos. Intentá nuevamente o verificá permisos de administrador.";
const ADMIN_RESOURCE_WRITE_ERROR = "No se pudo guardar el recurso. Intentá nuevamente o verificá permisos de administrador.";
const ADMIN_RESOURCE_NOT_FOUND_ERROR = "No encontramos el recurso solicitado. Puede haber sido modificado o no tenés permisos para verlo.";
const ADMIN_RESOURCE_LIFECYCLE_ERROR = "No se pudo cambiar el estado del recurso. Intentá nuevamente o verificá permisos de administrador.";
const ADMIN_RESOURCE_DELETE_CONFIRMATION_ERROR = "La eliminación es irreversible. Confirmá para continuar.";

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

export type AdminResourceFieldErrors = Record<string, string>;

export type AdminResourceSubmitStatus = "idle" | "submitting" | "success" | "validation-error" | "error";

export type AdminResourceSubmitResult = {
  status: Exclude<AdminResourceSubmitStatus, "idle" | "submitting">;
  resource: AdminResource | null;
  redirectTo: string | null;
  formError: string | null;
  fieldErrors: AdminResourceFieldErrors;
};

export type AdminResourceEditLoadStatus = "loading" | "success" | "not-found" | "error";

export type AdminResourceEditLoadState = {
  status: AdminResourceEditLoadStatus;
  draft: AdminResourceDraft | null;
  error: string | null;
};

type SubmitAdminResourceDraftOptions = {
  mode: "create" | "edit";
  id?: string;
  draft: unknown;
  repository: Pick<AdminResourceRepository, "create" | "update">;
};

function formatIssuePath(path: PropertyKey[]): string {
  return path.join(".");
}

function validationMessageForPath(path: string): string {
  if (path === "poblacion") return "Agregá al menos una población.";

  return "Campo obligatorio.";
}

export function resolveAdminResourceFieldErrors(input: unknown): AdminResourceFieldErrors {
  const result = adminResourceDraftSchema.safeParse(input);

  if (result.success) return {};

  return result.error.issues.reduce<AdminResourceFieldErrors>((errors, issue) => {
    const path = formatIssuePath(issue.path);
    if (path) errors[path] = validationMessageForPath(path);

    return errors;
  }, {});
}

export async function submitAdminResourceDraft({
  mode,
  id,
  draft,
  repository
}: SubmitAdminResourceDraftOptions): Promise<AdminResourceSubmitResult> {
  const parsed = adminResourceDraftSchema.safeParse(draft);

  if (!parsed.success) {
    return {
      status: "validation-error",
      resource: null,
      redirectTo: null,
      formError: null,
      fieldErrors: resolveAdminResourceFieldErrors(draft)
    };
  }

  try {
    const resource = mode === "create" ? await repository.create(parsed.data) : await repository.update(id ?? "", parsed.data);

    return {
      status: "success",
      resource,
      redirectTo: appRoutes.adminResources.path,
      formError: null,
      fieldErrors: {}
    };
  } catch {
    return {
      status: "error",
      resource: null,
      redirectTo: null,
      formError: ADMIN_RESOURCE_WRITE_ERROR,
      fieldErrors: {}
    };
  }
}

export function resolveAdminResourceEditLoad(resource: AdminResource | null): AdminResourceEditLoadState {
  if (!resource) {
    return {
      status: "not-found",
      draft: null,
      error: ADMIN_RESOURCE_NOT_FOUND_ERROR
    };
  }

  return {
    status: "success",
    draft: toAdminResourceDraft(resource),
    error: null
  };
}

export function resolveAdminResourceEditLoadError(): AdminResourceEditLoadState {
  return {
    status: "error",
    draft: null,
    error: "No se pudo cargar el recurso. Intentá nuevamente o verificá permisos de administrador."
  };
}

export type AdminResourceLifecycleAction = "archive" | "delete";

export type AdminResourceLifecycleSubmitStatus = "confirmation-required" | "success" | "error";

export type AdminResourceLifecycleSubmitResult = {
  status: AdminResourceLifecycleSubmitStatus;
  resource: AdminResource | null;
  formError: string | null;
  requiresConfirmation: boolean;
};

type SubmitAdminResourceLifecycleActionOptions = {
  action: AdminResourceLifecycleAction;
  id: string;
  confirmed?: boolean;
  repository: Pick<AdminResourceRepository, "archive" | "delete">;
};

export async function submitAdminResourceLifecycleAction({
  action,
  id,
  confirmed = true,
  repository
}: SubmitAdminResourceLifecycleActionOptions): Promise<AdminResourceLifecycleSubmitResult> {
  if (action === "delete" && !confirmed) {
    return {
      status: "confirmation-required",
      resource: null,
      formError: ADMIN_RESOURCE_DELETE_CONFIRMATION_ERROR,
      requiresConfirmation: true
    };
  }

  try {
    let resource: AdminResource | null = null;

    if (action === "archive") {
      resource = await repository.archive(id);
    } else {
      await repository.delete(id);
    }

    return {
      status: "success",
      resource,
      formError: null,
      requiresConfirmation: false
    };
  } catch {
    return {
      status: "error",
      resource: null,
      formError: ADMIN_RESOURCE_LIFECYCLE_ERROR,
      requiresConfirmation: false
    };
  }
}

export function createAdminResourceDraft(): AdminResourceDraft {
  return {
    nombre: "",
    tipo: "Otro",
    modalidad: RESOURCE_MODALIDADES[0],
    direccion: "",
    barrio: undefined,
    lat: 0,
    lng: 0,
    telefono: undefined,
    horario: undefined,
    poblacion: [],
    esCentroReferencia: false,
    observaciones: undefined,
    fuente: "",
    ultimaActualizacion: "2026-05-11",
    maintenance: {
      reviewBy: "2026-05-11"
    }
  };
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
      .catch(() => {
        if (active) setState((previous) => resolveAdminResourcesError(previous));
      });

    return () => {
      active = false;
    };
  }, [repository]);

  return state;
}
