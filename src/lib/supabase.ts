import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getUrl(): string {
  return (
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  );
}

function getAnonKey(): string {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
}

/** True when anon client env vars are present (build-time for Vite). */
export function isSupabaseConfigured(): boolean {
  return Boolean(getUrl() && getAnonKey());
}

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = getUrl();
  const key = getAnonKey();
  if (!url || !key) {
    throw new Error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_* equivalents).");
  }
  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return client;
}
