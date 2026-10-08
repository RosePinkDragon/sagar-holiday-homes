import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-only Supabase client. The anon / publishable key is public by
 * design — every table is locked down by RLS in supabase/schema.sql.
 *
 * Returns null when the env vars are missing (local dev without a project,
 * or a deploy before the owner has created one), so callers can degrade:
 * the admin shows a setup notice, the enquiry form skips the insert.
 *
 * The env vars are referenced literally so Next inlines them at build time.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client === undefined) {
    client = url && key ? createClient(url, key) : null;
  }
  return client;
}

export const isSupabaseConfigured = (): boolean => Boolean(url && key);
