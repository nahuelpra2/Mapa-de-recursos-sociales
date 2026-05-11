import { appRoutes } from "../../routes";
import type { AdminResource } from "../../data/adminResourceSchema";
import type { AdminResourcesListState } from "../../hooks/useAdminResources";

type AdminResourceListRow = {
  id: string;
  name: string;
  type: string;
  address: string;
  updatedAt: string;
  editHref: string;
};

export type AdminResourceListPresentation = {
  title: string;
  message: string;
  createHref: string;
  rows: AdminResourceListRow[];
};

function getAdminResourceEditHref(id: string): string {
  return appRoutes.adminResourceEdit.path.replace(":id", encodeURIComponent(id));
}

function toAdminResourceListRow(resource: AdminResource): AdminResourceListRow {
  return {
    id: resource.id,
    name: resource.nombre,
    type: resource.tipo,
    address: resource.direccion,
    updatedAt: resource.updatedAt,
    editHref: getAdminResourceEditHref(resource.id)
  };
}

export function resolveAdminResourceListPresentation(state: AdminResourcesListState): AdminResourceListPresentation {
  const base = {
    createHref: appRoutes.adminResourceNew.path,
    rows: state.resources.map(toAdminResourceListRow)
  };

  if (state.status === "loading") {
    return {
      ...base,
      title: "Cargando recursos",
      message: "Estamos buscando los recursos administrativos.",
      rows: []
    };
  }

  if (state.status === "error") {
    return {
      ...base,
      title: "No pudimos cargar los recursos",
      message: state.error ?? "No se pudieron cargar los recursos. Intentá nuevamente."
    };
  }

  if (state.status === "empty") {
    return {
      ...base,
      title: "Todavía no hay recursos cargados",
      message: "Creá el primer recurso para empezar a gestionar el mapa social.",
      rows: []
    };
  }

  return {
    ...base,
    title: "Recursos",
    message: `${state.resources.length} ${state.resources.length === 1 ? "recurso disponible" : "recursos disponibles"} para editar.`
  };
}
