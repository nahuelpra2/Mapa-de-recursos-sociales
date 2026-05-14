import { describe, expect, it } from "vitest";
import { defaultFilters } from "./useResourceSearchState";

describe("resource search state defaults", () => {
  it("includes modalidad in the public filter reset state", () => {
    expect(defaultFilters).toEqual({
      tipo: "",
      modalidad: "",
      poblacion: "",
      abiertoAhora: false
    });
  });
});
