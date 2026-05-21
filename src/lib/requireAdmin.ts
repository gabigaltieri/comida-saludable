import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sdlgfdmhasftbelztvqb.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbGdmZG1oYXNmdGJlbHp0dnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTgwODcsImV4cCI6MjA5Mzc3NDA4N30." +
  "toPTAtDrimueyJW01DXUg8fubA-QpbZno8zxcPFLy00";
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || "262cosasricas.web@gmail.com";

export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch { /* read-only en Route Handler */ }
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return null;
}
