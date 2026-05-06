import { describe, expect, it } from "vitest";
import { localResourceRepository } from "./localResourceRepository";
import { resources } from "./resources";

describe("local resource repository", () => {
  it("exposes the validated local resources", () => {
    expect(localResourceRepository.listResources()).toEqual(resources);
  });

  it("returns only reference centers", () => {
    expect(localResourceRepository.listReferenceCenters()).toEqual(
      resources.filter((resource) => resource.esCentroReferencia)
    );
  });

  it("returns sorted unique population options", () => {
    expect(localResourceRepository.listPopulationOptions()).toEqual(
      Array.from(new Set(resources.flatMap((resource) => resource.poblacion))).sort((a, b) => a.localeCompare(b))
    );
  });
});
