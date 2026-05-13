import { describe, expect, it, vi } from "vitest";
import { checkIsAdmin, restoreAdminSession, signInAdmin, signOutAdmin } from "./adminAuth";
import type { AdminAuthClient } from "./adminAuth";

type AdminAuthMockClient = AdminAuthClient & {
  auth: {
    signInWithPassword: ReturnType<typeof vi.fn>;
    getSession: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
  };
  rpc: ReturnType<typeof vi.fn>;
};

function createClient(overrides: Partial<{
  signInWithPassword: ReturnType<typeof vi.fn>;
  getSession: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  rpc: ReturnType<typeof vi.fn>;
}> = {}): AdminAuthMockClient {
  return {
    auth: {
      signInWithPassword: overrides.signInWithPassword ?? vi.fn(),
      getSession: overrides.getSession ?? vi.fn(),
      signOut: overrides.signOut ?? vi.fn()
    },
    rpc: overrides.rpc ?? vi.fn()
  } as AdminAuthMockClient;
}

const adminSession = { user: { id: "admin-user" }, access_token: "token" };

describe("admin auth helpers", () => {
  it("grants admin access only after valid credentials and allow-list authorization", async () => {
    const client = createClient({
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session: adminSession }, error: null }),
      rpc: vi.fn().mockResolvedValue({ data: true, error: null })
    });

    await expect(signInAdmin(client, "admin@example.com", "correct-password")).resolves.toEqual({
      status: "admin",
      session: adminSession,
      isAdmin: true,
      error: null
    });
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({ email: "admin@example.com", password: "correct-password" });
    expect(client.rpc).toHaveBeenCalledWith("is_admin");
  });

  it("returns a non-sensitive invalid credentials state when login fails", async () => {
    const client = createClient({
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null }, error: new Error("bad password") })
    });

    await expect(signInAdmin(client, "person@example.com", "wrong-password")).resolves.toEqual({
      status: "anonymous",
      session: null,
      isAdmin: false,
      error: "Credenciales inválidas."
    });
  });

  it("denies authenticated non-admin users and signs them out", async () => {
    const client = createClient({
      signInWithPassword: vi.fn().mockResolvedValue({ data: { session: adminSession }, error: null }),
      rpc: vi.fn().mockResolvedValue({ data: false, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null })
    });

    await expect(signInAdmin(client, "person@example.com", "password")).resolves.toEqual({
      status: "denied",
      session: null,
      isAdmin: false,
      error: "No tenés permisos de administración."
    });
    expect(client.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it("restores existing admin sessions after re-checking authorization", async () => {
    const client = createClient({
      getSession: vi.fn().mockResolvedValue({ data: { session: adminSession }, error: null }),
      rpc: vi.fn().mockResolvedValue({ data: true, error: null })
    });

    await expect(restoreAdminSession(client)).resolves.toEqual({
      status: "admin",
      session: adminSession,
      isAdmin: true,
      error: null
    });
  });

  it("keeps protected content hidden when session restore fails", async () => {
    const client = createClient({
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: new Error("network") })
    });

    await expect(restoreAdminSession(client)).resolves.toEqual({
      status: "error",
      session: null,
      isAdmin: false,
      error: "No se pudo verificar la sesión."
    });
  });

  it("clears admin access on logout", async () => {
    const client = createClient({ signOut: vi.fn().mockResolvedValue({ error: null }) });

    await expect(signOutAdmin(client)).resolves.toEqual({
      status: "anonymous",
      session: null,
      isAdmin: false,
      error: null
    });
    expect(client.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it("uses the database admin boundary instead of trusting the session", async () => {
    const client = createClient({ rpc: vi.fn().mockResolvedValue({ data: false, error: null }) });

    await expect(checkIsAdmin(client)).resolves.toBe(false);
    expect(client.rpc).toHaveBeenCalledWith("is_admin");
  });
});
