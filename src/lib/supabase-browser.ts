import { createClient } from "@supabase/supabase-js";

export function createSupabaseBrowser() {
  return createClient(
    "https://sdlgfdmhasftbelztvqb.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbGdmZG1oYXNmdGJlbHp0dnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTgwODcsImV4cCI6MjA5Mzc3NDA4N30.toPTAtDrimueyJW01DXUg8fubA-QpbZno8zxcPFLy00"
  );
}
