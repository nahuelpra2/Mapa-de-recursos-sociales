import type { Coordinates, Resource } from "../types/resource";
import { createMapLink } from "./maps";

export function buildResourceClipboardText(resource: Resource, origin?: Coordinates) {
  return [
    `Centro: ${resource.nombre}`,
    `Tipo: ${resource.tipo}`,
    `Direccion: ${resource.direccion}`,
    `Telefono: ${resource.telefono || "No informado"}`,
    `Horario: ${resource.horario || "No informado"}`,
    `Poblacion atendida: ${resource.poblacion.join(", ")}`,
    resource.observaciones ? `Observaciones: ${resource.observaciones}` : undefined,
    `Como llegar: ${createMapLink(resource, origin)}`,
    `Fuente: ${resource.fuente}`,
    `Ultima actualizacion: ${resource.ultimaActualizacion}`
  ]
    .filter(Boolean)
    .join("\n");
}

export async function copyResourceToClipboard(resource: Resource, origin?: Coordinates) {
  const text = buildResourceClipboardText(resource, origin);

  if (!navigator.clipboard) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "true");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textArea);
    return ok;
  }

  await navigator.clipboard.writeText(text);
  return true;
}
