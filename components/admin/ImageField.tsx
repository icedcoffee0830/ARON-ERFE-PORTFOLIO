"use client";

import { useRef, useState } from "react";
import { ImageSquare, Trash, UploadSimple, WarningCircle } from "@phosphor-icons/react";
import type { Img } from "@/content/projects";
import { ratioOf } from "@/lib/admin/image";
import { useEditor } from "./context";
import { Button, Select, TextInput } from "./ui";

const PRESETS = ["1 / 1", "4 / 5", "3 / 4", "3 / 2", "4 / 3", "16 / 10", "16 / 9"];

export function ImageField({
  label,
  value,
  onChange,
  folder,
  fixedRatio,
  fixedRatioNote,
  fit = "cover",
  tone,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  altHint = "What the image shows, for screen readers and search engines.",
  showAlt = true,
}: {
  label: string;
  value: Img;
  onChange: (v: Img) => void;
  /** Project slug (or "portrait"). */
  folder: string;
  /** When set, the frame is decided elsewhere (e.g. by discipline) and no ratio picker is shown. */
  fixedRatio?: string;
  fixedRatioNote?: string;
  /** "contain" shows the whole image (logos); "cover" crops like the site does. */
  fit?: "cover" | "contain";
  /** Forces a light or dark preview background, to check a logo against it. */
  tone?: "light" | "dark";
  accept?: string;
  altHint?: string;
  showAlt?: boolean;
}) {
  const { upload, resolve } = useEditor();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const broken = Boolean(value.src) && brokenSrc === value.src;

  const ratio = fixedRatio ?? value.ratio ?? "4 / 3";

  async function take(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const up = await upload(file, folder);
      onChange({
        ...value,
        src: up.path,
        ratio: fixedRatio ? value.ratio : ratioOf(up.width, up.height),
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const ratioOptions = [
    ...(value.ratio && !PRESETS.includes(value.ratio)
      ? [{ value: value.ratio, label: `Original (${value.ratio.replace(" / ", ":")})` }]
      : []),
    ...PRESETS.map((p) => ({ value: p, label: p.replace(" / ", ":") })),
  ];

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-2 text-sm font-medium">{label}</legend>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,240px)_1fr]">
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            take(e.dataTransfer.files[0]);
          }}
          disabled={busy}
          aria-label={value.src ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
          className={`group relative w-full overflow-hidden border transition-colors ${
            tone === "light" ? "bg-[#f2f2f0] text-[#5c5c58]" : tone === "dark" ? "bg-[#111110] text-[#9b9b96]" : "bg-bg-sunk"
          } ${
            over ? "border-accent" : "border-line hover:border-muted"
          }`}
          style={{ aspectRatio: ratio }}
        >
          {value.src && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolve(value.src)}
              alt=""
              onError={() => setBrokenSrc(value.src)}
              className={`absolute inset-0 size-full ${fit === "contain" ? "object-contain p-4" : "object-cover"} transition-opacity ${busy ? "opacity-40" : ""}`}
            />
          ) : (
            <span className={`absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center text-[13px] ${tone ? "" : "text-muted"}`}>
              {value.src && broken ? (
                <>
                  <ImageSquare size={22} />
                  Preview appears after the site updates
                </>
              ) : (
                <>
                  <UploadSimple size={22} />
                  {busy ? "Uploading…" : "Click or drop an image"}
                </>
              )}
            </span>
          )}
          {busy && value.src && (
            <span className="absolute inset-0 flex items-center justify-center text-sm font-medium">
              Uploading…
            </span>
          )}
        </button>

        <div className="flex flex-col gap-4">
          {showAlt && (<TextInput
            label="Description (alt text)"
            hint={altHint}
            value={value.alt}
            onChange={(alt) => onChange({ ...value, alt })}
            placeholder="e.g. Logo on the shop sign"
          />)}
          {!fixedRatio && value.src && (
            <Select
              label="Frame shape"
              value={value.ratio ?? "4 / 3"}
              options={ratioOptions}
              onChange={(r) => onChange({ ...value, ratio: r })}
            />
          )}
          {fixedRatioNote && <p className="text-[13px] text-muted">{fixedRatioNote}</p>}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => input.current?.click()} disabled={busy}>
              <UploadSimple size={16} weight="bold" />
              {value.src ? "Replace" : "Upload"}
            </Button>
            {value.src && (
              <Button variant="ghost" onClick={() => onChange({ ...value, src: "" })} disabled={busy}>
                <Trash size={16} />
                Remove
              </Button>
            )}
          </div>
          {error && (
            <p role="alert" className="flex items-start gap-2 text-[13px] text-accent">
              <WarningCircle size={16} className="mt-px shrink-0" />
              {error}
            </p>
          )}
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => take(e.target.files?.[0])}
      />
    </fieldset>
  );
}
