import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

export const AUTOMATION_MEDIA_BUCKET = "automation-media";

export function createSupabaseAdminClient() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
