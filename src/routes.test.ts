import { describe, expect, it } from "vitest";
import { appRoutes, configuredAdminRoutePaths } from "./routes";

describe("app route definitions", () => {
  it("preserves the public resource experience at the root route", () => {
    expect(appRoutes.public.path).toBe("/");
    expect(appRoutes.public.label).toBe("public-resources");
  });

  it("keeps admin login and protected admin routes inside the admin boundary", () => {
    expect(appRoutes.adminLogin.path).toBe("/admin/login");
    expect(appRoutes.admin.path).toBe("/admin");
    expect(appRoutes.admin.protected).toBe(true);
  });

  it("configures only the Phase 5 admin resource list, create, and edit routes", () => {
    expect(appRoutes.adminResources.path).toBe("/admin/resources");
    expect(appRoutes.adminResourceNew.path).toBe("/admin/resources/new");
    expect(appRoutes.adminResourceEdit.path).toBe("/admin/resources/:id/edit");
    expect(appRoutes.adminResources.protected).toBe(true);
    expect(appRoutes.adminResourceNew.protected).toBe(true);
    expect(appRoutes.adminResourceEdit.protected).toBe(true);

    expect(configuredAdminRoutePaths).toEqual([
      "/admin/login",
      "/admin",
      "/admin/resources",
      "/admin/resources/new",
      "/admin/resources/:id/edit"
    ]);
  });

  it("does not configure out-of-scope admin delete, bulk, geocoding, upload, user, invite, or role routes", () => {
    expect(configuredAdminRoutePaths).not.toContain("/admin/resources/:id/delete");
    expect(configuredAdminRoutePaths).not.toContain("/admin/resources/:id/archive");
    expect(configuredAdminRoutePaths).not.toContain("/admin/resources/:id/deactivate");
    expect(configuredAdminRoutePaths).not.toContain("/admin/resources/bulk");
    expect(configuredAdminRoutePaths).not.toContain("/admin/resources/geocoding");
    expect(configuredAdminRoutePaths).not.toContain("/admin/resources/uploads");
    expect(configuredAdminRoutePaths).not.toContain("/admin/users");
    expect(configuredAdminRoutePaths).not.toContain("/admin/invite");
    expect(configuredAdminRoutePaths).not.toContain("/admin/roles");
  });
});
