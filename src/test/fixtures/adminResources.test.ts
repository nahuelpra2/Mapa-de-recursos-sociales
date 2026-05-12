import { describe, expect, it } from "vitest";
import { createAdminResource } from "./adminResources";

describe("admin resource fixtures", () => {
  it("creates active admin resources with no deletion timestamp by default", () => {
    expect(createAdminResource()).toEqual(expect.objectContaining({ estado: "activo", deletedAt: null }));
  });

  it("allows lifecycle fixtures to override inactive state and deletion timestamp", () => {
    expect(
      createAdminResource({
        estado: "inactivo",
        deletedAt: "2026-05-12T12:00:00Z"
      })
    ).toEqual(expect.objectContaining({ estado: "inactivo", deletedAt: "2026-05-12T12:00:00Z" }));
  });
});
