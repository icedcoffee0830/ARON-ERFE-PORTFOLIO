import { NextResponse } from "next/server";
import {
  HINT_COOKIE,
  SESSION_COOKIE,
  adminConfigured,
  checkPassword,
  cookieBase,
  createSession,
  sameOrigin,
} from "@/lib/admin/auth";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  if (!adminConfigured())
    return NextResponse.json({ error: "ADMIN_PASSWORD is not set." }, { status: 503 });

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (typeof password !== "string" || !checkPassword(password)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const { token, maxAge } = createSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, { ...cookieBase, httpOnly: true, maxAge });
  res.cookies.set(HINT_COOKIE, "1", { ...cookieBase, httpOnly: false, maxAge });
  return res;
}
