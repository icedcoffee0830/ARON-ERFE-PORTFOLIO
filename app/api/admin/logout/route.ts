import { NextResponse } from "next/server";
import { HINT_COOKIE, SESSION_COOKIE, cookieBase, sameOrigin } from "@/lib/admin/auth";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...cookieBase, maxAge: 0 });
  res.cookies.set(HINT_COOKIE, "", { ...cookieBase, maxAge: 0 });
  return res;
}
