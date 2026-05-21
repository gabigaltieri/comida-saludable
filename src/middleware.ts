import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sdlgfdmhasftbelztvqb.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbGdmZG1oYXNmdGJlbHp0dnFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxOTgwODcsImV4cCI6MjA5Mzc3NDA4N30.toPTAtDrimueyJW01DXUg8fubA-QpbZno8zxcPFLy00",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getSession();
    user = data.session?.user ?? null;
  } catch {
    // Supabase unavailable — treat as unauthenticated
  }

  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const adminEmail = process.env.ADMIN_EMAIL || "262cosasricas.web@gmail.com";
  const isAdmin = user?.email === adminEmail;

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Cliente logueado intentando acceder al admin → redirigir al inicio
  if (user && !isAdmin && !isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdmin && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*"],
};
