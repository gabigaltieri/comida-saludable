import { createClient } from "@supabase/supabase-js";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sdlgfdmhasftbelztvqb.supabase.co").trim();
const anon = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbGdmZG1oYXNmdGJlbHp0dnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTgwODcsImV4cCI6MjA5Mzc3NDA4N30." +
  "toPTAtDrimueyJW01DXUg8fubA-QpbZno8zxcPFLy00"
).replace(/\s+/g, "");
const service = (process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder").replace(/\s+/g, "");

// Fetch sin caché para que Next.js nunca sirva datos viejos
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

export const supabase = createClient(url, anon, {
  global: { fetch: noStoreFetch },
});

export const supabaseAdmin = createClient(url, service, {
  global: { fetch: noStoreFetch },
});
