export type AdminAuthStatus = "loading" | "anonymous" | "admin" | "denied" | "error";

export type AdminSession = {
  user?: { id?: string };
  [key: string]: unknown;
};

export type AdminAuthState =
  | { status: "loading"; session: null; isAdmin: false; error: null }
  | { status: "anonymous" | "denied" | "error"; session: null; isAdmin: false; error: string | null }
  | { status: "admin"; session: AdminSession; isAdmin: true; error: null };

export type AdminAuthClient = {
  auth: {
    signInWithPassword(credentials: { email: string; password: string }): Promise<{
      data?: { session?: AdminSession | null } | null;
      error?: unknown;
    }>;
    getSession(): Promise<{ data?: { session?: AdminSession | null } | null; error?: unknown }>;
    signOut(): Promise<{ error?: unknown }>;
  };
  rpc(name: "is_admin"): Promise<{ data?: boolean | null; error?: unknown }>;
};

export const loadingAdminState: AdminAuthState = { status: "loading", session: null, isAdmin: false, error: null };
export const anonymousAdminState: AdminAuthState = { status: "anonymous", session: null, isAdmin: false, error: null };

const INVALID_CREDENTIALS_MESSAGE = "Credenciales inválidas.";
const DENIED_MESSAGE = "No tenés permisos de administración.";
const SESSION_ERROR_MESSAGE = "No se pudo verificar la sesión.";

export async function checkIsAdmin(client: AdminAuthClient): Promise<boolean> {
  const { data, error } = await client.rpc("is_admin");

  if (error) return false;
  return data === true;
}

async function stateFromSession(client: AdminAuthClient, session: AdminSession | null): Promise<AdminAuthState> {
  if (!session) return anonymousAdminState;

  const isAdmin = await checkIsAdmin(client);
  if (isAdmin) return { status: "admin", session, isAdmin: true, error: null };

  await client.auth.signOut();
  return { status: "denied", session: null, isAdmin: false, error: DENIED_MESSAGE };
}

export async function signInAdmin(client: AdminAuthClient, email: string, password: string): Promise<AdminAuthState> {
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data?.session) {
    return { status: "anonymous", session: null, isAdmin: false, error: INVALID_CREDENTIALS_MESSAGE };
  }

  return stateFromSession(client, data.session);
}

export async function restoreAdminSession(client: AdminAuthClient | null): Promise<AdminAuthState> {
  if (!client) return anonymousAdminState;

  try {
    const { data, error } = await client.auth.getSession();
    if (error) return { status: "error", session: null, isAdmin: false, error: SESSION_ERROR_MESSAGE };

    return stateFromSession(client, data?.session ?? null);
  } catch {
    return { status: "error", session: null, isAdmin: false, error: SESSION_ERROR_MESSAGE };
  }
}

export async function signOutAdmin(client: AdminAuthClient | null): Promise<AdminAuthState> {
  if (client) await client.auth.signOut();
  return anonymousAdminState;
}
