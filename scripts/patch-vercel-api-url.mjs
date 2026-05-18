// Patches vercel.json /api rewrite to point at the Railway API (CI deploy step).
// Usage: RAILWAY_PUBLIC_URL=https://xxx.up.railway.app node scripts/patch-vercel-api-url.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vercelPath = path.join(root, "vercel.json");

const raw = process.env.RAILWAY_PUBLIC_URL?.trim();
if (!raw) {
  console.error("RAILWAY_PUBLIC_URL is required (e.g. https://your-api.up.railway.app)");
  process.exit(1);
}

const base = raw.replace(/\/+$/, "");
if (!/^https?:\/\//i.test(base)) {
  console.error("RAILWAY_PUBLIC_URL must start with http:// or https://");
  process.exit(1);
}

const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
const rewrite = vercel.rewrites?.find((r) => r.source === "/api/(.*)");
if (!rewrite) {
  console.error('vercel.json: no rewrite with source "/api/(.*)"');
  process.exit(1);
}

rewrite.destination = `${base}/api/$1`;
writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);
console.log(`Patched vercel.json API proxy → ${base}/api/$1`);
