import { describe, expect, it } from "vitest";
import { getLoginRouteDecision } from "./adminAuthDecisions";
import type { AdminAuthState } from "../lib/adminAuth";

describe("admin auth state routing decisions", () => {
  it("keeps login visible for anonymous users", () => {
    const state: AdminAuthState = { status: "anonymous", session: null, isAdmin: false, error: null };

    expect(getLoginRouteDecision(state)).toEqual({ type: "show-login" });
  });

  it("redirects authorized admins away from login", () => {
    const state: AdminAuthState = { status: "admin", session: { user: { id: "1" } }, isAdmin: true, error: null };

    expect(getLoginRouteDecision(state)).toEqual({ type: "redirect", to: "/admin" });
  });
});
