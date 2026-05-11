import { describe, expect, it } from "vitest";
import { getAdminResourceFormPresentation } from "./adminResourceFormModel";

describe("admin resource form presentation", () => {
  it("groups controlled create fields with safe labels and submit copy", () => {
    expect(getAdminResourceFormPresentation({ mode: "create", isSubmitting: false, fieldErrors: {} })).toEqual({
      title: "Crear recurso",
      submitLabel: "Crear recurso",
      disabled: false,
      fieldsets: expect.arrayContaining([
        expect.objectContaining({ legend: "Datos básicos", fields: expect.arrayContaining([expect.objectContaining({ name: "nombre", label: "Nombre", required: true })]) }),
        expect.objectContaining({ legend: "Verificación", fields: expect.arrayContaining([expect.objectContaining({ name: "verification.source", label: "Fuente de verificación", required: true })]) })
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
});
