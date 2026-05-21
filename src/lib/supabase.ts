import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

// Fetch sin caché para que Next.js nunca sirva datos viejos
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

export const supabase = createClient(url, anon, {
  global: { fetch: noStoreFetch },
});

export const supabaseAdmin = createClient(url, service, {
  global: { fetch: noStoreFetch },
});
