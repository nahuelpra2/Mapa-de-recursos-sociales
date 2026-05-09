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

  it("does not configure out-of-scope admin CRUD, invite, or role-management routes", () => {
    expect(configuredAdminRoutePaths).not.toContain("/admin/resources");
    expect(configuredAdminRoutePaths).not.toContain("/admin/invite");
    expect(configuredAdminRoutePaths).not.toContain("/admin/roles");
  });
});
