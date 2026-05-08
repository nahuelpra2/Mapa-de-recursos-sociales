import { describe, expect, it } from "vitest";
import { createResource } from "../test/fixtures/resources";
import {
  createPublicResourcesReadyState,
  resolvePublicResourcesError,
  resolvePublicResourcesSuccess,
  shouldShowPublicResourceResults
} from "./usePublicResources";

const referenceCenter = createResource({
  id: "reference-center",
  nombre: "Centro de referencia",
  poblacion: ["Familias", "Adultos"],
  esCentroReferencia: true
});

const regularResource = createResource({
  id: "regular-resource",
  nombre: "Recurso barrial",
  poblacion: ["Adultos"],
  esCentroReferencia: false
});

describe("public resource loading state", () => {
  it("builds the ready state from asynchronously loaded resources", () => {
    const state = resolvePublicResourcesSuccess([regularResource, referenceCenter]);

    expect(state).toEqual({
      status: "ready",
      resources: [regularResource, referenceCenter],
      referenceCenters: [referenceCenter],
      populationOptions: ["Adultos", "Familias"],
      error: null
    });
  });

  it("keeps an empty ready state distinct from loading and error states", () => {
    expect(resolvePublicResourcesSuccess([])).toEqual({
      status: "ready",
      resources: [],
      referenceCenters: [],
      populationOptions: [],
      error: null
    });
  });

  it("preserves the last successful resources when a later load fails", () => {
    const previous = createPublicResourcesReadyState([referenceCenter]);

    expect(resolvePublicResourcesError(previous, new Error("Supabase unavailable"))).toEqual({
      ...previous,
      status: "error",
      error: "No se pudieron cargar los recursos. Probá nuevamente en unos minutos."
    });
  });

  it("starts with an empty error state when the first load fails", () => {
    expect(resolvePublicResourcesError(undefined, "timeout")).toEqual({
      status: "error",
      resources: [],
      referenceCenters: [],
      populationOptions: [],
      error: "No se pudieron cargar los recursos. Probá nuevamente en unos minutos."
    });
  });

  it("does not show the final empty results state while resources are still loading", () => {
    expect(shouldShowPublicResourceResults("loading")).toBe(false);
    expect(shouldShowPublicResourceResults("ready")).toBe(true);
    expect(shouldShowPublicResourceResults("error")).toBe(true);
  });
});
