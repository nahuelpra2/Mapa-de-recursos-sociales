import { describe, expect, it } from "vitest";
import { appRoutes } from "../routes";
import { getAdminShellNavigation } from "./adminShellNavigation";

describe("admin shell navigation", () => {
  it("adds a safe resources-list link inside the admin shell", () => {
    expect(getAdminShellNavigation()).toEqual([
      { label: "Inicio", href: appRoutes.admin.path },
      { label: "Recursos", href: appRoutes.adminResources.path }
    ]);
  });

  it("does not expose out-of-scope admin actions in shell navigation", () => {
    const hrefs = getAdminShellNavigation().map((item) => item.href);

    expect(hrefs).not.toContain("/admin/resources/bulk");
    expect(hrefs).not.toContain("/admin/resources/:id/delete");
    expect(hrefs).not.toContain("/admin/users");
  });
});
