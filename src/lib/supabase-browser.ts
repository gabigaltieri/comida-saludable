import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sdlgfdmhasftbelztvqb.supabase.co").trim();
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbGdmZG1oYXNmdGJlbHp0dnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTgwODcsImV4cCI6MjA5Mzc3NDA4N30.toPTAtDrimueyJW01DXUg8fubA-QpbZno8zxcPFLy00").trim();

export function createSupabaseBrowser() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
