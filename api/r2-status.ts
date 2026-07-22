import fs from "fs";
import path from "path";

export default async function handler(req: any, res: any) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const missing: string[] = [];
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) missing.push("CLOUDFLARE_ACCOUNT_ID");
  if (!process.env.R2_ACCESS_KEY_ID) missing.push("R2_ACCESS_KEY_ID");
  if (!process.env.R2_SECRET_ACCESS_KEY) missing.push("R2_SECRET_ACCESS_KEY");
  if (!process.env.R2_BUCKET_NAME) missing.push("R2_BUCKET_NAME");
  if (!process.env.R2_PUBLIC_URL) missing.push("R2_PUBLIC_URL");

  return res.status(200).json({
    configured: missing.length === 0,
    missing: missing,
    details: {
      has_account_id: !!process.env.CLOUDFLARE_ACCOUNT_ID,
      has_access_key: !!process.env.R2_ACCESS_KEY_ID,
      has_secret_key: !!process.env.R2_SECRET_ACCESS_KEY,
      has_bucket_name: !!process.env.R2_BUCKET_NAME,
      has_public_url: !!process.env.R2_PUBLIC_URL,
    },
  });
}
