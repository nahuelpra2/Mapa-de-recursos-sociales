import { describe, expect, it } from "vitest";
import { createAdminResource } from "../../test/fixtures/adminResources";
import { appRoutes } from "../../routes";
import { resolveAdminResourceListPresentation } from "./adminResourceListPresentation";

describe("admin resource list presentation", () => {
  it("describes loading, error, and empty states with safe copy and a create action", () => {
    expect(resolveAdminResourceListPresentation({ status: "loading", resources: [], error: null })).toEqual({
      title: "Cargando recursos",
      message: "Estamos buscando los recursos administrativos.",
      createHref: appRoutes.adminResourceNew.path,
      rows: []
    });

    expect(
      resolveAdminResourceListPresentation({
        status: "error",
        resources: [],
        error: "No se pudieron cargar los recursos. Intentá nuevamente o verificá permisos de administrador."
      })
    ).toEqual({
      title: "No pudimos cargar los recursos",
      message: "No se pudieron cargar los recursos. Intentá nuevamente o verificá permisos de administrador.",
      createHref: appRoutes.adminResourceNew.path,
      rows: []
    });

    expect(resolveAdminResourceListPresentation({ status: "empty", resources: [], error: null })).toEqual({
      title: "Todavía no hay recursos cargados",
      message: "Creá el primer recurso para empezar a gestionar el mapa social.",
      createHref: appRoutes.adminResourceNew.path,
      rows: []
    });
  });

  it("maps successful resources to edit-ready rows without delete or bulk actions", () => {
    const resource = createAdminResource({
      id: "resource-1",
      nombre: "Comedor comunitario",
      tipo: "Alimentos",
      direccion: "Calle 123",
      updatedAt: "2026-05-10T12:00:00Z"
    });

    expect(resolveAdminResourceListPresentation({ status: "success", resources: [resource], error: null })).toEqual({
      title: "Recursos",
      message: "1 recurso disponible para editar.",
      createHref: appRoutes.adminResourceNew.path,
      rows: [
        {
          id: "resource-1",
          name: "Comedor comunitario",
          type: "Alimentos",
          address: "Calle 123",
          updatedAt: "2026-05-10T12:00:00Z",
          editHref: "/admin/resources/resource-1/edit"
        }
      ]
    });
  });
});
