import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO = process.env.CONTACT_EMAIL ?? "262cosasricas.web@gmail.com";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function esc(str: unknown): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!rateLimit(`contact:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Demasiadas solicitudes. Intentá en un momento." }, { status: 429 });
  }

  const body = await req.json();
  const { tipo, nombre, empresa, mail, telefono, empleados, detalle } = body;

  const isEmpresas = tipo === "empresas";

  // ── Guardar en Supabase ───────────────────────────────────────────────────
  const { error: dbError } = await supabase.from("leads").insert({
    tipo,
    nombre,
    empresa: empresa ?? null,
    mail,
    telefono,
    empleados: empleados ? Number(empleados) : null,
    mensaje: detalle ?? null,
  });

  if (dbError) {
    console.error("Supabase leads insert error:", dbError);
    // No cortamos el flujo — igual intentamos mandar el mail
  }

  // ── Armar email ───────────────────────────────────────────────────────────
  const subject = isEmpresas
    ? `Nueva consulta viandas empresas - ${nombre}`
    : `Nueva consulta catering - ${nombre}`;

  const headerTitle = isEmpresas ? "Consulta Viandas para Empresas" : "Consulta Catering para Eventos";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#2a402b;padding:24px 32px;border-radius:12px 12px 0 0">
        <h2 style="color:white;margin:0;font-size:20px;font-weight:600">${headerTitle}</h2>
        <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px">262 Cosas Ricas</p>
      </div>
      <div style="background:#f9f9f7;padding:32px;border:1px solid #e0dbd4;border-top:none;border-radius:0 0 12px 12px">
        <p style="margin:0 0 4px;color:#666;font-size:12px">Nombre</p>
        <p style="margin:0 0 16px;font-weight:600;color:#1a1a1a;font-size:14px">${esc(nombre)}</p>
        <p style="margin:0 0 4px;color:#666;font-size:12px">Email</p>
        <p style="margin:0 0 16px;font-size:14px"><a href="mailto:${esc(mail)}" style="color:#547d54">${esc(mail)}</a></p>
        <p style="margin:0 0 4px;color:#666;font-size:12px">Telefono</p>
        <p style="margin:0 0 16px;font-weight:600;color:#1a1a1a;font-size:14px">${esc(telefono)}</p>
        ${detalle ? `
        <p style="margin:0 0 4px;color:#666;font-size:12px">Mensaje</p>
        <p style="margin:0;background:white;border:1px solid #e0dbd4;border-radius:8px;padding:14px;color:#333;font-size:14px;line-height:1.6">${esc(detalle).replace(/\n/g, "<br>")}</p>
        ` : ""}
      </div>
      <p style="color:#aaa;font-size:11px;text-align:center;margin-top:16px">262 Cosas Ricas - Tte. Gral. Eustoquio Frias 262, CABA</p>
    </div>
  `;

  // ── Enviar email ──────────────────────────────────────────────────────────
  try {
    const { error } = await resend.emails.send({
      from: "262 Cosas Ricas <onboarding@resend.dev>",
      to: [TO],
      replyTo: mail,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error), "| tipo:", tipo, "| subject:", subject);
      return NextResponse.json({ ok: true, emailWarning: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact API error:", err);
    // Si el dato se guardó en Supabase, igual consideramos éxito
    if (!dbError) return NextResponse.json({ ok: true, emailWarning: true });
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
