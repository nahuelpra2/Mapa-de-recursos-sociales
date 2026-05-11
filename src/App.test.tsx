import { describe, expect, it } from "vitest";
import { appRoutes } from "./routes";
import { getProtectedAdminRouteConfiguration } from "./appRouteConfiguration";

describe("protected admin route mounting", () => {
  it("mounts the resource list, create, and edit screens below the existing admin boundary", () => {
    expect(getProtectedAdminRouteConfiguration()).toEqual({
      parentPath: appRoutes.admin.path,
      indexPath: appRoutes.admin.path,
      childPaths: [appRoutes.adminResources.path, appRoutes.adminResourceNew.path, appRoutes.adminResourceEdit.path]
    });
  });
});
