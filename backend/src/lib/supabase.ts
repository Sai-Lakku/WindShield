import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

if (!env.supabaseUrl || !env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for backend persistence.");
}

export const supabase = createClient(env.supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
