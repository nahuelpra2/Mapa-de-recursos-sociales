import { describe, expect, it } from "vitest";
import { PublicResourcesStatus } from "./PublicResourcesStatus";

function collectText(value: unknown): string[] {
  if (typeof value === "string" || typeof value === "number") return [String(value)];
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(collectText);

  const maybeElement = value as { props?: { children?: unknown } };

  return collectText(maybeElement.props?.children);
}

describe("PublicResourcesStatus", () => {
  it("announces resource loading while the async repository is pending", () => {
    const element = PublicResourcesStatus({ status: "loading", error: null });
    const props = element?.props as { role?: string; children?: unknown };

    expect(props.role).toBe("status");
    expect(collectText(element).join(" ")).toContain("Cargando recursos");
  });

  it("announces resource loading failures as an alert", () => {
    const element = PublicResourcesStatus({ status: "error", error: "No se pudieron cargar los recursos." });
    const props = element?.props as { role?: string; children?: unknown };

    expect(props.role).toBe("alert");
    expect(collectText(element).join(" ")).toContain("No se pudieron cargar los recursos.");
  });

  it("renders nothing once resources are ready", () => {
    expect(PublicResourcesStatus({ status: "ready", error: null })).toBeNull();
  });
});
