import { NextResponse } from "next/server";
import { isAuthed, sameOrigin } from "@/lib/admin/auth";
import { getStore, isAllowedImagePath, type Content, type UploadRef } from "@/lib/admin/store";
import { validate } from "@/lib/admin/validate";

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  if (!(await isAuthed())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = (await req.json().catch(() => null)) as
    | (Content & { uploads?: UploadRef[] })
    | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const problems = validate(body.site, body.projects);
  if (problems.length) return NextResponse.json({ error: problems.join(" ") }, { status: 422 });

  // Only commit uploaded images that the content still uses.
  const used = JSON.stringify({ site: body.site, projects: body.projects });
  const uploads = (body.uploads ?? []).filter(
    (u) => typeof u?.path === "string" && isAllowedImagePath(u.path) && used.includes(`"${u.path}"`),
  );

  try {
    const result = await getStore().save({ site: body.site, projects: body.projects }, uploads);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
