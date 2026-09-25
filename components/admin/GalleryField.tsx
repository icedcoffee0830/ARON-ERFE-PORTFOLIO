"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImageSquare, Trash, UploadSimple, WarningCircle } from "@phosphor-icons/react";
import { GALLERY_MAX, type Img } from "@/content/projects";
import { ratioOf } from "@/lib/admin/image";
import { useEditor } from "./context";
import { Button, IconButton, inputClass } from "./ui";

/*
  Edits a list of any length. Files upload one after another; each finished image
  is appended through the *latest* value and onChange (kept in refs), so edits made
  while a batch is uploading are never overwritten.
*/
export function GalleryField({
  value,
  onChange,
  folder,
}: {
  value: Img[];
  onChange: (images: Img[]) => void;
  folder: string;
}) {
  const { upload, resolve } = useEditor();
  const input = useRef<HTMLInputElement>(null);
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };

  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const [broken, setBroken] = useState<Set<string>>(new Set());

  const room = GALLERY_MAX - value.length;
  const busy = progress !== null;

  async function addFiles(list: FileList | null) {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (!files.length || busy) return;
    const take = files.slice(0, room);
    const problems: string[] = [];
    if (files.length > room) problems.push(`Only ${room} more image${room === 1 ? "" : "s"} fit (${GALLERY_MAX} max). The rest were skipped.`);

    setErrors([]);
    setProgress({ done: 0, total: take.length });
    for (const [n, file] of take.entries()) {
      try {
        const up = await upload(file, folder);
        const { value: now, onChange: emit } = latest.current;
        emit([...now, { src: up.path, alt: "", ratio: ratioOf(up.width, up.height) }]);
      } catch (e) {
        problems.push(`${file.name}: ${(e as Error).message}`);
      }
      setProgress({ done: n + 1, total: take.length });
    }
    setProgress(null);
    setErrors(problems);
    if (input.current) input.current.value = "";
  }

  const setAlt = (i: number, alt: string) =>
    onChange(value.map((item, j) => (j === i ? { ...item, alt } : item)));
  const move = (i: number, d: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        disabled={busy || room <= 0}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-center text-sm transition-colors disabled:cursor-not-allowed ${
          over ? "border-accent bg-bg-sunk" : "border-line hover:border-muted"
        }`}
      >
        <UploadSimple size={22} className="text-muted" />
        {busy ? (
          <span aria-live="polite">
            Uploading {progress.done + 1 > progress.total ? progress.total : progress.done + 1} of {progress.total}…
          </span>
        ) : room <= 0 ? (
          <span className="text-muted">This gallery is full ({GALLERY_MAX} images).</span>
        ) : (
          <>
            <span className="font-medium">Click to choose images, or drop them here</span>
            <span className="text-[13px] text-muted">Select as many as you like. They keep their own shape on the site.</span>
          </>
        )}
      </button>

      {busy && (
        <div className="h-1 w-full bg-bg-sunk" aria-hidden>
          <div className="h-full bg-fg transition-[width] duration-300" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
        </div>
      )}

      {errors.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 text-[13px] text-accent">
          {errors.map((m) => (
            <li key={m} className="flex items-start gap-2">
              <WarningCircle size={16} className="mt-px shrink-0" />
              {m}
            </li>
          ))}
        </ul>
      )}

      {value.length > 0 && (
        <>
          <p className="text-[13px] text-muted">
            {value.length} image{value.length === 1 ? "" : "s"}. Shown on the site in this order, left to right.
          </p>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {value.map((img, i) => (
              <li key={img.src + i} className="flex flex-col border border-line">
                <div className="relative aspect-square bg-bg-sunk">
                  {img.src && !broken.has(img.src) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolve(img.src)}
                      alt=""
                      onError={() => setBroken((s) => new Set(s).add(img.src))}
                      className="absolute inset-0 size-full object-contain p-2"
                    />
                  ) : (
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 text-center text-[12px] text-muted">
                      <ImageSquare size={20} />
                      {img.src ? "Preview after the site updates" : "Missing image"}
                    </span>
                  )}
                  <span className="absolute left-1.5 top-1.5 bg-bg/90 px-1.5 font-mono text-[11px]">{i + 1}</span>
                </div>
                <div className="flex items-center justify-between border-t border-line">
                  <div className="flex">
                    <IconButton label={`Move image ${i + 1} earlier`} disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowLeft size={15} />
                    </IconButton>
                    <IconButton label={`Move image ${i + 1} later`} disabled={i === value.length - 1} onClick={() => move(i, 1)}>
                      <ArrowRight size={15} />
                    </IconButton>
                  </div>
                  <IconButton
                    label={`Remove image ${i + 1}`}
                    className="hover:text-accent"
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                  >
                    <Trash size={15} />
                  </IconButton>
                </div>
                <input
                  aria-label={`Description of image ${i + 1}`}
                  placeholder="Describe (optional)"
                  value={img.alt}
                  onChange={(e) => setAlt(i, e.target.value)}
                  className={`${inputClass} border-x-0 border-b-0 px-2 py-2 text-[13px]`}
                />
              </li>
            ))}
          </ol>
          {room > 0 && !busy && (
            <div>
              <Button onClick={() => input.current?.click()}>
                <UploadSimple size={16} weight="bold" /> Add more images
              </Button>
            </div>
          )}
        </>
      )}

      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  );
}
