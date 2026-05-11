import { describe, expect, it } from "vitest";
import { appRoutes } from "./routes";
import { getProtectedAdminRouteConfiguration } from "./appRouteConfiguration";

describe("protected admin route mounting", () => {
  it("mounts the resource list below the existing admin boundary", () => {
    expect(getProtectedAdminRouteConfiguration()).toEqual({
      parentPath: appRoutes.admin.path,
      indexPath: appRoutes.admin.path,
      childPaths: [appRoutes.adminResources.path]
    });
  });

  it("keeps create and edit routes declared but outside the list slice mounting", () => {
    const configuration = getProtectedAdminRouteConfiguration();

    expect(configuration.childPaths).not.toContain(appRoutes.adminResourceNew.path);
    expect(configuration.childPaths).not.toContain(appRoutes.adminResourceEdit.path);
  });
});
