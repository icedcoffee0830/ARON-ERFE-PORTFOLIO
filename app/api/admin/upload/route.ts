import { NextResponse } from "next/server";
import { isAuthed, sameOrigin } from "@/lib/admin/auth";
import { getStore, isAllowedImagePath } from "@/lib/admin/store";
import { SLUG_RE, slugify } from "@/lib/admin/validate";

// Stays under Vercel's 4.5 MB request limit; the editor compresses images well below this.
const MAX_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  if (!(await isAuthed())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const folder = String(form?.get("folder") ?? "");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });

  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Use a JPG, PNG, WebP or GIF image." }, { status: 415 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "That image is too large (4 MB max)." }, { status: 413 });

  const stem = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const id = `${Date.now().toString(36)}-${stem}`.slice(0, 100);
  const publicPath =
    folder === "portrait"
      ? `/portrait-${Date.now().toString(36)}.${ext}`
      : SLUG_RE.test(folder)
        ? `/work/${folder}/${id}.${ext}`
        : null;
  if (!publicPath || !isAllowedImagePath(publicPath))
    return NextResponse.json({ error: "Set the project's page address before adding images." }, { status: 400 });

  try {
    const ref = await getStore().upload(publicPath, Buffer.from(await file.arrayBuffer()));
    return NextResponse.json(ref);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
