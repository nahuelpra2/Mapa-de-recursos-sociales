import { describe, expect, it } from "vitest";
import { ResourceCard } from "./ResourceCard";
import { createResource } from "../test/fixtures/resources";
import type { ResourceWithDistance } from "../types/resource";

function collectText(value: unknown): string[] {
  if (typeof value === "string" || typeof value === "number") return [String(value)];
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(collectText);

  const maybeElement = value as { props?: { children?: unknown } };

  return collectText(maybeElement.props?.children);
}

function renderCardText(resource: ResourceWithDistance): string {
  return collectText(ResourceCard({ resource, onCopy: () => undefined })).join(" ");
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
});
