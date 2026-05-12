import { appRoutes } from "../../routes";
import type { AdminResource } from "../../data/adminResourceSchema";
import type { AdminResourcesListState } from "../../hooks/useAdminResources";

export type AdminResourceListLifecycleStatus = "idle" | "confirming-delete" | "success" | "error";

export type AdminResourceListLifecycleState = {
  status: AdminResourceListLifecycleStatus;
  pendingDeleteId: string | null;
  message: string | null;
};

type AdminResourceListRow = {
  id: string;
  name: string;
  type: string;
  address: string;
  statusLabel: string;
  updatedAt: string;
  editHref: string;
  archive: {
    label: string;
    disabled: boolean;
  };
  delete: {
    label: string;
  };
};

export type AdminResourceListPresentation = {
  title: string;
  message: string;
  createHref: string;
  lifecycleMessage?: string | null;
  lifecycleTone?: "warning" | "success" | "error" | null;
  pendingDeleteId?: string | null;
  rows: AdminResourceListRow[];
};

function getAdminResourceEditHref(id: string): string {
  return appRoutes.adminResourceEdit.path.replace(":id", encodeURIComponent(id));
}

export function formatAdminResourceUpdatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  const parts = new Intl.DateTimeFormat("es-UY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Montevideo"
  }).formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes): string => parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("day")}/${getPart("month")}/${getPart("year")} ${getPart("hour")}:${getPart("minute")}`;
}

function toAdminResourceListRow(resource: AdminResource): AdminResourceListRow {
  return {
    id: resource.id,
    name: resource.nombre,
    type: resource.tipo,
    address: resource.direccion,
    statusLabel: resource.estado === "activo" ? "Activo" : "Inactivo",
    updatedAt: formatAdminResourceUpdatedAt(resource.updatedAt),
    editHref: getAdminResourceEditHref(resource.id),
    archive: {
      label: resource.estado === "activo" ? "Archivar" : "Archivado",
      disabled: resource.estado !== "activo"
    },
    delete: {
      label: "Eliminar definitivamente"
    }
  };
}

function resolveLifecycleTone(state: AdminResourceListLifecycleState): "warning" | "success" | "error" | null {
  if (state.status === "confirming-delete") return "warning";
  if (state.status === "success") return "success";
  if (state.status === "error") return "error";

  return null;
}

function resolveLifecycleMessage(state: AdminResourceListLifecycleState): string | null {
  if (state.status === "confirming-delete") {
    return state.message ?? "Eliminar definitivamente es irreversible. Confirmá para continuar.";
  }

  return state.message;
}

export function resolveAdminResourceListPresentation(
  state: AdminResourcesListState,
  lifecycleState: AdminResourceListLifecycleState = { status: "idle", pendingDeleteId: null, message: null }
): AdminResourceListPresentation {
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
    message: `${state.resources.length} ${state.resources.length === 1 ? "recurso disponible" : "recursos disponibles"} para editar, archivar o eliminar definitivamente.`,
    lifecycleMessage: resolveLifecycleMessage(lifecycleState),
    lifecycleTone: resolveLifecycleTone(lifecycleState),
    pendingDeleteId: lifecycleState.pendingDeleteId
  };
}
