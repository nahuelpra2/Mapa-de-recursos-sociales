import { describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn(() => ({ from: vi.fn() })));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock
}));

describe("Supabase browser client", () => {
  it("returns null when the Vite Supabase env vars are missing", async () => {
    const { createBrowserSupabaseClient } = await import("./supabaseClient");

    expect(createBrowserSupabaseClient({ VITE_SUPABASE_URL: "", VITE_SUPABASE_ANON_KEY: "" })).toBeNull();
    expect(createClientMock).not.toHaveBeenCalledWith("", "");
  });

  it("creates a browser client from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY", async () => {
    const { createBrowserSupabaseClient } = await import("./supabaseClient");

    const client = createBrowserSupabaseClient({
      VITE_SUPABASE_URL: "https://project.supabase.co",
      VITE_SUPABASE_ANON_KEY: "public-anon-key"
    });

    expect(client).toEqual({ from: expect.any(Function) });
    expect(createClientMock).toHaveBeenCalledWith("https://project.supabase.co", "public-anon-key");
  });
});
