import { describe, expect, it } from "vitest";
import { ResourceCard } from "./ResourceCard";
import { createResource } from "../test/fixtures/resources";
import type { ResourceWithDistance } from "../types/resource";

function collectText(value: unknown): string[] {
  if (typeof value === "string" || typeof value === "number") return [String(value)];
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(collectText);

  const maybeElement = value as { type?: unknown; props?: { children?: unknown } };

  if (typeof maybeElement.type === "function" && maybeElement.props) {
    return collectText(maybeElement.type(maybeElement.props));
  }

  return collectText(maybeElement.props?.children);
}

function renderCardText(resource: ResourceWithDistance): string {
  return collectText(ResourceCard({ resource, isExpanded: false, onToggle: () => undefined, onCopy: () => undefined })).join(" ");
}

function renderExpandedCardText(resource: ResourceWithDistance): string {
  return collectText(ResourceCard({ resource, isExpanded: true, onToggle: () => undefined, onCopy: () => undefined })).join(" ");
}

describe("ResourceCard", () => {
  it("shows the reference-center badge only for reference centers", () => {
    expect(renderCardText(createResource({ esCentroReferencia: true }))).toContain("Centro de referencia");
    expect(renderCardText(createResource({ esCentroReferencia: false }))).not.toContain("Centro de referencia");
  });

  it("does not bring back legacy access labels", () => {
    const text = renderCardText(createResource({ esCentroReferencia: true }));

    expect(text.toLowerCase()).not.toContain("derivacion");
    expect(text.toLowerCase()).not.toContain("acceso directo");
  });

  it("keeps the compact card focused on summary information", () => {
    const text = renderCardText(createResource({ observaciones: "Traer documentacion si corresponde" }));

    expect(text).toContain("Ver detalle");
    expect(text).toContain("Personas adultas");
    expect(text).not.toContain("Observaciones");
    expect(text).not.toContain("Copiar datos");
  });

  it("shows the full operational detail when expanded", () => {
    const text = renderExpandedCardText(createResource({ observaciones: "Traer documentacion si corresponde" }));

    expect(text).toContain("Cerrar detalle");
    expect(text).toContain("Direccion");
    expect(text).toContain("Horario");
    expect(text).toContain("Telefono");
    expect(text).toContain("Observaciones");
    expect(text).toContain("Copiar datos");
  });
});
