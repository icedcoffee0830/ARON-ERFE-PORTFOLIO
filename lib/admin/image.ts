/*
  Shrinks photos in the browser before upload: longest side 2400px, WebP.
  Keeps uploads fast, the repo small, and each request under Vercel's size limit.
  GIFs pass through untouched so animation survives.
*/

const MAX_SIDE = 2400;

export type Prepared = { file: File; width: number; height: number };

export async function prepareImage(input: File): Promise<Prepared> {
  if (!input.type.startsWith("image/")) throw new Error("That file is not an image.");

  const bitmap = await createImageBitmap(input).catch(() => {
    throw new Error("This image format can't be read. Export it as JPG or PNG.");
  });
  const { width, height } = bitmap;

  if (input.type === "image/gif") {
    bitmap.close();
    return { file: input, width, height };
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
  if (!blob) throw new Error("Could not process this image.");
  const name = input.name.replace(/\.[^.]+$/, "") + ".webp";
  return { file: new File([blob], name, { type: "image/webp" }), width: w, height: h };
}

/** "1600 / 1000" → "8 / 5" */
export function ratioOf(w: number, h: number) {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = gcd(w, h) || 1;
  return `${w / g} / ${h / g}`;
}
