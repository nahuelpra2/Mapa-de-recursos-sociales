import { appRoutes } from "../../routes";
import type { AdminResourceEditLoadStatus, AdminResourceSubmitStatus } from "../../hooks/useAdminResources";

type CreatePresentationOptions = {
  submitStatus: AdminResourceSubmitStatus;
};

type EditPresentationOptions = {
  loadStatus: AdminResourceEditLoadStatus;
  submitStatus: AdminResourceSubmitStatus;
};

export function resolveAdminResourceCreatePresentation({ submitStatus }: CreatePresentationOptions) {
  return {
    title: "Crear recurso",
    message: "Completá los datos obligatorios antes de guardar. No se usan datos locales de respaldo.",
    backHref: appRoutes.adminResources.path,
    successMessage: submitStatus === "success" ? "Recurso creado. Volviendo al listado de recursos." : null,
    unavailableActions: []
  };
}

export function resolveAdminResourceEditPresentation({ loadStatus, submitStatus }: EditPresentationOptions) {
  if (loadStatus === "loading") {
    return {
      title: "Cargando recurso",
      message: "Estamos buscando el recurso solicitado.",
      backHref: appRoutes.adminResources.path,
      canShowForm: false,
      successMessage: null
    };
  }

  if (loadStatus === "not-found") {
    return {
      title: "No encontramos el recurso",
      message: "No encontramos el recurso solicitado. Puede haber sido modificado o no tenés permisos para verlo.",
      backHref: appRoutes.adminResources.path,
      canShowForm: false,
      successMessage: null
    };
  }

  if (loadStatus === "error") {
    return {
      title: "No pudimos cargar el recurso",
      message: "No se pudo cargar el recurso. Intentá nuevamente o verificá permisos de administrador.",
      backHref: appRoutes.adminResources.path,
      canShowForm: false,
      successMessage: null
    };
  }

  return {
    title: "Editar recurso",
    message: "Actualizá los datos obligatorios antes de guardar.",
    backHref: appRoutes.adminResources.path,
    canShowForm: true,
    successMessage: submitStatus === "success" ? "Recurso actualizado. Volviendo al listado de recursos." : null
  };
}
