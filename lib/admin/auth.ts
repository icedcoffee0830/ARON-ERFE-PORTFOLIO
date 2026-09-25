import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/*
  Single-owner password login. The session cookie is `<expiry>.<hmac(expiry)>`,
  signed with ADMIN_SECRET (falls back to ADMIN_PASSWORD), so it cannot be forged
  and changing either variable signs everyone out.
*/

export const SESSION_COOKIE = "pf_admin";
/** Readable by client JS; only tells the public site to show the Edit button. Grants nothing. */
export const HINT_COOKIE = "pf_admin_hint";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function key() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(value: string) {
  return createHmac("sha256", key()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare HMACs so the comparison is constant-time regardless of input length.
  return safeEqual(sign(`pw:${input}`), sign(`pw:${expected}`));
}

export function createSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return { token: `${exp}.${sign(exp)}`, maxAge: MAX_AGE };
}

export async function isAuthed() {
  if (!adminConfigured()) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac || !safeEqual(mac, sign(exp))) return false;
  return Number(exp) > Date.now();
}

/** Rejects state-changing requests that come from another site. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export const cookieBase = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};
