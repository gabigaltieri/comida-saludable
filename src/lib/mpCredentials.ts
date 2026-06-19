import { supabaseAdmin } from "./supabase";

export interface MPCredentials {
  accessToken: string;
  publicKey: string;
  webhookSecret: string;
}

export async function getMPCredentials(): Promise<MPCredentials> {
  const { data } = await supabaseAdmin
    .from("settings")
    .select("key, value")
    .in("key", ["mp_access_token", "mp_public_key", "mp_webhook_secret"]);

  const map: Record<string, string> = {};
  data?.forEach((row) => { map[row.key] = row.value || ""; });

  return {
    accessToken: map["mp_access_token"] || process.env.MP_ACCESS_TOKEN || "",
    publicKey: map["mp_public_key"] || process.env.MP_PUBLIC_KEY || "",
    webhookSecret: map["mp_webhook_secret"] || process.env.MP_WEBHOOK_SECRET || "",
  };
}
