import { describe, expect, it } from "vitest";
import { resolveNextSelectedResourceId } from "./useSelectedResource";

describe("selected resource state", () => {
  it("opens a resource when no resource is selected", () => {
    expect(resolveNextSelectedResourceId(null, "resource-a")).toBe("resource-a");
  });

  it("closes the current resource when the same one is selected again", () => {
    expect(resolveNextSelectedResourceId("resource-a", "resource-a")).toBeNull();
  });

  it("switches the open resource when a different one is selected", () => {
    expect(resolveNextSelectedResourceId("resource-a", "resource-b")).toBe("resource-b");
  });
});
