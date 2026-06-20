import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://262cosasricas.com.ar";

export async function POST(req: NextRequest) {
  const { email, password, nombre, telefono } = await req.json();

  if (!email || !password || !nombre || !telefono) {
    return NextResponse.json({ error: "Faltan datos requeridos." }, { status: 400 });
  }

  // Genera el usuario + link de confirmación usando el admin API (no SMTP)
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: { redirectTo: `${SITE_URL}/` },
  });

  if (error) {
    const alreadyExists =
      error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("already been registered") ||
      error.message.toLowerCase().includes("user already exists");
    if (alreadyExists) {
      return NextResponse.json({ error: "Este email ya tiene una cuenta. Iniciá sesión." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const confirmLink = data.properties?.action_link;

  // Guardar perfil en Supabase
  await supabaseAdmin.from("profiles").upsert({
    id: data.user.id,
    nombre,
    telefono,
    updated_at: new Date().toISOString(),
  });

  // Enviar email de confirmación via Resend API (no SMTP)
  if (confirmLink) {
    await resend.emails.send({
      from: "262 Cosas Ricas <noreply@262cosasricas.com.ar>",
      to: [email],
      subject: "Confirmá tu cuenta en 262 Cosas Ricas",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#2a402b;padding:24px 32px;border-radius:12px 12px 0 0">
            <h2 style="color:white;margin:0;font-size:20px;font-weight:600">262 Cosas Ricas</h2>
            <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px">Confirmá tu cuenta</p>
          </div>
          <div style="background:#f9f9f7;padding:32px;border:1px solid #e0dbd4;border-top:none;border-radius:0 0 12px 12px">
            <p style="margin:0 0 16px;color:#333;font-size:14px">Hola <strong>${nombre}</strong>,</p>
            <p style="margin:0 0 24px;color:#333;font-size:14px">
              Gracias por registrarte. Hacé clic en el botón para confirmar tu email y activar tu cuenta.
            </p>
            <a href="${confirmLink}"
               style="display:inline-block;background:#547d54;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
              Confirmar mi cuenta
            </a>
            <p style="margin:24px 0 0;color:#aaa;font-size:12px">
              Si no creaste una cuenta en 262 Cosas Ricas, podés ignorar este email.
            </p>
          </div>
          <p style="color:#aaa;font-size:11px;text-align:center;margin-top:16px">
            262 Cosas Ricas - Tte. Gral. Eustoquio Frias 262, CABA
          </p>
        </div>
      `,
    });
  }

  return NextResponse.json({ ok: true });
}
