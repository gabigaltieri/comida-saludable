import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { data: authData, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, nombre, telefono");

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const users = authData.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    nombre: profileMap[u.id]?.nombre ?? null,
    telefono: profileMap[u.id]?.telefono ?? null,
    email_confirmed_at: u.email_confirmed_at ?? null,
    last_sign_in_at: u.last_sign_in_at ?? null,
    created_at: u.created_at,
  }));

  // Más recientes primero
  users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(users);
}

export async function DELETE(req: Request) {
  const deny = await requireAdmin();
  if (deny) return deny;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Falta el id." }, { status: 400 });

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
