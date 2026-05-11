import { describe, expect, it } from "vitest";
import { createAdminResource } from "../test/fixtures/adminResources";
import {
  createAdminResourcesLoadingState,
  resolveAdminResourcesError,
  resolveAdminResourcesSuccess,
  shouldShowAdminResourceRows
} from "./useAdminResources";

describe("admin resource list state", () => {
  it("starts with a loading state before admin resources resolve", () => {
    expect(createAdminResourcesLoadingState()).toEqual({
      status: "loading",
      resources: [],
      error: null
    });
  });

  it("builds a success state with enough resource data to choose edit", () => {
    const foodBank = createAdminResource({ id: "food-bank", nombre: "Banco de alimentos", tipo: "Alimentos" });
    const shelter = createAdminResource({ id: "shelter", nombre: "Refugio norte", tipo: "Alojamiento" });

    expect(resolveAdminResourcesSuccess([foodBank, shelter])).toEqual({
      status: "success",
      resources: [foodBank, shelter],
      error: null
    });
  });

  it("keeps empty resources explicit instead of pretending the list is still loading", () => {
    expect(resolveAdminResourcesSuccess([])).toEqual({
      status: "empty",
      resources: [],
      error: null
    });
  });

  it("shows a recoverable non-sensitive error and preserves previous resources when reload fails", () => {
    const previous = resolveAdminResourcesSuccess([createAdminResource({ id: "known-resource" })]);

    expect(resolveAdminResourcesError(previous, new Error("JWT claim admin_users missing"))).toEqual({
      ...previous,
      status: "error",
      error: "No se pudieron cargar los recursos. Intentá nuevamente o verificá permisos de administrador."
    });
  });

  it("shows rows only after a successful non-empty load", () => {
    expect(shouldShowAdminResourceRows(createAdminResourcesLoadingState())).toBe(false);
    expect(shouldShowAdminResourceRows(resolveAdminResourcesSuccess([]))).toBe(false);
    expect(shouldShowAdminResourceRows(resolveAdminResourcesSuccess([createAdminResource()]))).toBe(true);
  });
});
