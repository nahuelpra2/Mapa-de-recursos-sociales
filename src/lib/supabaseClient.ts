import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabaseClientEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

function hasSupabaseEnv(env: SupabaseClientEnv): env is Required<SupabaseClientEnv> {
  return Boolean(env.VITE_SUPABASE_URL?.trim() && env.VITE_SUPABASE_ANON_KEY?.trim());
}

export function createBrowserSupabaseClient(env: SupabaseClientEnv = import.meta.env as SupabaseClientEnv): SupabaseClient | null {
  if (!hasSupabaseEnv(env)) return null;

  return createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
}

export const supabase = createBrowserSupabaseClient();
