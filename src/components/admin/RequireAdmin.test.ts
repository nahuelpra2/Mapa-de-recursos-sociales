import { describe, expect, it } from "vitest";
import { getRequireAdminDecision } from "./requireAdminDecision";
import type { AdminAuthState } from "../../lib/adminAuth";

const adminState: AdminAuthState = { status: "admin", session: { user: { id: "1" } }, isAdmin: true, error: null };

describe("RequireAdmin decisions", () => {
  it("hides protected content while admin auth is loading", () => {
    expect(getRequireAdminDecision({ status: "loading", session: null, isAdmin: false, error: null })).toEqual({
      type: "loading"
    });
  });

  it("redirects anonymous users to admin login", () => {
    expect(getRequireAdminDecision({ status: "anonymous", session: null, isAdmin: false, error: null })).toEqual({
      type: "redirect",
      to: "/admin/login"
    });
  });

  it("shows access denied for authenticated non-admin users", () => {
    expect(getRequireAdminDecision({ status: "denied", session: null, isAdmin: false, error: "No tenés permisos" })).toEqual({
      type: "denied",
      message: "No tenés permisos"
    });
  });

  it("allows only authorized admin sessions through", () => {
    expect(getRequireAdminDecision(adminState)).toEqual({ type: "allow" });
  });
});
