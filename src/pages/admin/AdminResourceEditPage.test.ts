import { describe, expect, it } from "vitest";
import { appRoutes } from "../../routes";
import { resolveAdminResourceEditPresentation } from "./adminResourceFormPresentation";

describe("admin resource edit page presentation", () => {
  it("describes loading, not-found, error, and success edit states safely", () => {
    expect(resolveAdminResourceEditPresentation({ loadStatus: "loading", submitStatus: "idle" })).toEqual({
      title: "Cargando recurso",
      message: "Estamos buscando el recurso solicitado.",
      backHref: appRoutes.adminResources.path,
      canShowForm: false,
      successMessage: null
    });

    expect(resolveAdminResourceEditPresentation({ loadStatus: "not-found", submitStatus: "idle" })).toEqual({
      title: "No encontramos el recurso",
      message: "No encontramos el recurso solicitado. Puede haber sido modificado o no tenés permisos para verlo.",
      backHref: appRoutes.adminResources.path,
      canShowForm: false,
      successMessage: null
    });

    expect(resolveAdminResourceEditPresentation({ loadStatus: "error", submitStatus: "idle" })).toEqual({
      title: "No pudimos cargar el recurso",
      message: "No se pudo cargar el recurso. Intentá nuevamente o verificá permisos de administrador.",
      backHref: appRoutes.adminResources.path,
      canShowForm: false,
      successMessage: null
    });

    expect(resolveAdminResourceEditPresentation({ loadStatus: "success", submitStatus: "success" })).toEqual({
      title: "Editar recurso",
      message: "Actualizá los datos obligatorios antes de guardar.",
      backHref: appRoutes.adminResources.path,
      canShowForm: true,
      successMessage: "Recurso actualizado. Volviendo al listado de recursos."
    });
  });
});
