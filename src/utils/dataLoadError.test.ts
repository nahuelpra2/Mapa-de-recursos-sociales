import { describe, expect, it } from "vitest";
import {
  getConciseTechnicalDetail,
  getDataLoadErrorViewModel,
  isResourceDataLoadError
} from "./dataLoadError";
import { validateResources } from "../data/resourceSchema";
import { createResource } from "../test/fixtures/resources";

describe("data load error fallback content", () => {
  it("classifies resource validation failures as data load errors", () => {
    const invalidResource = createResource({ lat: -91 });

    expect(() => validateResources([invalidResource])).toThrow();

    try {
      validateResources([invalidResource]);
    } catch (error) {
      expect(isResourceDataLoadError(error)).toBe(true);
      expect(getDataLoadErrorViewModel(error, false)).toMatchObject({
        title: "No se pudieron cargar los recursos",
        technicalDetail: undefined
      });
      expect(getDataLoadErrorViewModel(error, false).message).toContain("iniciativa independiente y no oficial");
      expect(getDataLoadErrorViewModel(error, false).message).toContain("no pasaron la validación");
    }
  });

  it("keeps user-facing content free of raw technical details by default", () => {
    const viewModel = getDataLoadErrorViewModel(new Error("boom\nstack line 1\nstack line 2"), false);

    expect(viewModel.title).toBe("No se pudo mostrar el mapa");
    expect(viewModel.message).toContain("iniciativa independiente y no oficial");
    expect(viewModel.message).not.toContain("stack line");
    expect(viewModel.technicalDetail).toBeUndefined();
  });

  it("exposes only a concise first-line technical detail when requested", () => {
    const error = new Error("Invalid bundled resource data: resources.json failed validation.\n- stack-looking detail");

    expect(getConciseTechnicalDetail(error)).toBe("Invalid bundled resource data: resources.json failed validation.");
    expect(getDataLoadErrorViewModel(error, true).technicalDetail).toBe(
      "Invalid bundled resource data: resources.json failed validation."
    );
  });
});
