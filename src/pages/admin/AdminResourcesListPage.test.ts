import { describe, expect, it } from "vitest";
import { createAdminResource } from "../../test/fixtures/adminResources";
import { appRoutes } from "../../routes";
import { formatAdminResourceUpdatedAt, resolveAdminResourceListPresentation } from "./adminResourceListPresentation";
import { AdminResourcesListPage } from "./AdminResourcesListPage";

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

  it("maps successful resources to edit-ready rows with archive/delete actions and delete confirmation copy", () => {
    const active = createAdminResource({
      id: "resource-1",
      nombre: "Comedor comunitario",
      tipo: "Alimentos",
      direccion: "Calle 123",
      updatedAt: "2026-05-10T12:00:00Z"
    });
    const inactive = createAdminResource({
      id: "resource-2",
      nombre: "Refugio norte",
      tipo: "Alojamiento",
      direccion: "Ruta 8",
      estado: "inactivo",
      deletedAt: "2026-05-12T12:00:00Z",
      updatedAt: "2026-05-12T12:00:00Z"
    });

    expect(
      resolveAdminResourceListPresentation(
        { status: "success", resources: [active, inactive], error: null },
        { status: "confirming-delete", pendingDeleteId: "resource-2", message: null }
      )
    ).toEqual({
      title: "Recursos",
      message: "2 recursos disponibles para editar, archivar o eliminar definitivamente.",
      createHref: appRoutes.adminResourceNew.path,
      lifecycleMessage: "Eliminar definitivamente es irreversible. Confirmá para continuar.",
      lifecycleTone: "warning",
      pendingDeleteId: "resource-2",
      rows: [
        {
          id: "resource-1",
          name: "Comedor comunitario",
          type: "Alimentos",
          address: "Calle 123",
          updatedAt: "10/05/2026 09:00",
          statusLabel: "Activo",
          editHref: "/admin/resources/resource-1/edit",
          archive: { label: "Archivar", disabled: false },
          delete: { label: "Eliminar definitivamente" }
        },
        {
          id: "resource-2",
          name: "Refugio norte",
          type: "Alojamiento",
          address: "Ruta 8",
          updatedAt: "12/05/2026 09:00",
          statusLabel: "Inactivo",
          editHref: "/admin/resources/resource-2/edit",
          archive: { label: "Archivado", disabled: true },
          delete: { label: "Eliminar definitivamente" }
        }
      ]
    });
  });

  it("keeps archive/delete errors safe and non-sensitive", () => {
    const resource = createAdminResource({ id: "resource-1", nombre: "Comedor comunitario", direccion: "Calle Admin 123" });

    expect(
      resolveAdminResourceListPresentation(
        { status: "success", resources: [resource], error: null },
        { status: "error", pendingDeleteId: null, message: "No se pudo cambiar el estado del recurso. Intentá nuevamente o verificá permisos de administrador." }
      )
    ).toEqual({
      title: "Recursos",
      message: "1 recurso disponible para editar, archivar o eliminar definitivamente.",
      createHref: appRoutes.adminResourceNew.path,
      lifecycleMessage: "No se pudo cambiar el estado del recurso. Intentá nuevamente o verificá permisos de administrador.",
      lifecycleTone: "error",
      pendingDeleteId: null,
      rows: [
        {
          id: "resource-1",
          name: "Comedor comunitario",
          type: "Centro de atención",
          address: "Calle Admin 123",
          updatedAt: "01/05/2026 07:00",
          statusLabel: "Activo",
          editHref: "/admin/resources/resource-1/edit",
          archive: { label: "Archivar", disabled: false },
          delete: { label: "Eliminar definitivamente" }
        }
      ]
    });
  });

  it("formats Supabase UTC timestamps as local Montevideo time", () => {
    expect(formatAdminResourceUpdatedAt("2026-05-11T14:40:34.151296+00:00")).toBe("11/05/2026 11:40");
  });

  it("exports the admin resources page component for the protected admin route", () => {
    expect(AdminResourcesListPage).toBeTypeOf("function");
  });
});
