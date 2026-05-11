import { describe, expect, it } from "vitest";
import { appRoutes } from "../../routes";
import { resolveAdminResourceCreatePresentation } from "./adminResourceFormPresentation";

describe("admin resource create page presentation", () => {
  it("describes the create screen and success navigation without delete or geocoding actions", () => {
    expect(resolveAdminResourceCreatePresentation({ submitStatus: "idle" })).toEqual({
      title: "Crear recurso",
      message: "Completá los datos obligatorios antes de guardar. No se usan datos locales de respaldo.",
      backHref: appRoutes.adminResources.path,
      successMessage: null,
      unavailableActions: []
    });

    expect(resolveAdminResourceCreatePresentation({ submitStatus: "success" }).successMessage).toBe(
      "Recurso creado. Volviendo al listado de recursos."
    );
  });
});
