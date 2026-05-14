import { describe, expect, it } from "vitest";
import { RESOURCE_MODALIDADES } from "../../data/resourceSchema";
import { createAdminResourceDraft } from "../../test/fixtures/adminResources";
import { AdminResourceForm } from "./AdminResourceForm";
import { getAdminResourceFormPresentation } from "./adminResourceFormModel";

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

describe("admin resource form presentation", () => {
  it("groups controlled create fields with safe labels and submit copy", () => {
    expect(getAdminResourceFormPresentation({ mode: "create", isSubmitting: false, fieldErrors: {} })).toEqual({
      title: "Crear recurso",
      submitLabel: "Crear recurso",
      disabled: false,
      fieldsets: expect.arrayContaining([
        expect.objectContaining({
          legend: "Datos básicos",
          fields: expect.arrayContaining([
            expect.objectContaining({ name: "nombre", label: "Nombre", required: true }),
            expect.objectContaining({ name: "modalidad", label: "Modalidad", required: true, input: "select" })
          ])
        }),
        expect.objectContaining({ legend: "Mantenimiento", fields: expect.arrayContaining([expect.objectContaining({ name: "maintenance.reviewBy", label: "Revisar antes de", required: true })]) })
      ]),
      outOfScopeActions: []
    });
  });

  it("returns edit submit copy, disabled state, and field-safe validation messages without delete actions", () => {
    expect(
      getAdminResourceFormPresentation({
        mode: "edit",
        isSubmitting: true,
        fieldErrors: { nombre: "Campo obligatorio.", "maintenance.reviewBy": "Campo obligatorio." }
      })
    ).toEqual({
      title: "Editar recurso",
      submitLabel: "Guardando...",
      disabled: true,
      fieldsets: expect.arrayContaining([
        expect.objectContaining({ fields: expect.arrayContaining([expect.objectContaining({ name: "nombre", error: "Campo obligatorio." })]) }),
        expect.objectContaining({ fields: expect.arrayContaining([expect.objectContaining({ name: "maintenance.reviewBy", error: "Campo obligatorio." })]) })
      ]),
      outOfScopeActions: []
    });
  });

  it("renders the modalidad select with the current value and catalog options", () => {
    const draft = createAdminResourceDraft({ modalidad: RESOURCE_MODALIDADES[1] });

    const tree = AdminResourceForm({
      mode: "create",
      draft,
      fieldErrors: {},
      formError: null,
      isSubmitting: false,
      onChange: () => undefined,
      onSubmit: () => undefined
    });

    const labels = collectElements(tree).filter((element) => element.type === "label");
    const modalidadLabel = labels.find((element) => collectText(element).join(" ").includes("Modalidad"));

    expect(modalidadLabel).toBeDefined();

    const select = collectElements(modalidadLabel).find((element) => element.type === "select");
    const options = collectElements(select).filter((element) => element.type === "option");

    expect(select?.props?.value).toBe(RESOURCE_MODALIDADES[1]);
    expect(options.map((option) => collectText(option).join(" "))).toEqual(["Seleccioná una modalidad", ...RESOURCE_MODALIDADES]);
  });
});
