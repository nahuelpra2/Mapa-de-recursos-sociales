import { describe, expect, it } from "vitest";
import { Filters } from "./Filters";
import { RESOURCE_MODALIDADES } from "../data/resourceSchema";
import type { FiltersState } from "../types/resource";

function collectElements(node: unknown): Array<{ type?: unknown; props?: { children?: unknown; value?: unknown } }> {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(collectElements);

  const element = node as { type?: unknown; props?: { children?: unknown } };
  return [element, ...collectElements(element.props?.children)];
}

function collectText(node: unknown): string[] {
  if (typeof node === "string" || typeof node === "number") return [String(node)];
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(collectText);

  const element = node as { type?: unknown; props?: { children?: unknown } };
  if (typeof element.type === "function" && element.props) return collectText(element.type(element.props));

  return collectText(element.props?.children);
}

describe("Filters", () => {
  it("renders the modalidad control with the current value and catalog options", () => {
    const filters: FiltersState = {
      tipo: "",
      modalidad: "Nocturno Mixto",
      poblacion: "",
      abiertoAhora: false
    };

    const tree = Filters({ filters, populationOptions: ["Personas adultas"], onChange: () => undefined, onClear: () => undefined });
    const labels = collectElements(tree).filter((element) => element.type === "label");
    const modalidadLabel = labels.find((element) => collectText(element).join(" ").includes("Modalidad"));

    expect(modalidadLabel).toBeDefined();

    const select = collectElements(modalidadLabel).find((element) => element.type === "select");
    const options = collectElements(select).filter((element) => element.type === "option");

    expect(select?.props?.value).toBe("Nocturno Mixto");
    expect(collectText(select).join(" ")).toContain("Nocturno Mixto");
    expect(collectText(select).join(" ")).toContain("Todas");
    expect(options.map((option) => collectText(option).join(" "))).toEqual(["Todas", ...RESOURCE_MODALIDADES]);
  });
});
