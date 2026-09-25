"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import type { Img } from "@/content/projects";

/*
  Lays out any number of images in rows. Every image in a row shares one height,
  so each keeps its own proportions and the row spans the full width.
  Rows that would be too tall (one portrait on its own) are narrowed and centred.
  Phones get one image per row. Clicking an image opens it full screen.
*/

const MAX_ROW = 3.6; // sum of width/height per row: 3 squares, 2 landscapes, 4 portraits
const MAX_ITEMS = 4;
const MIN_ROW = 1.6; // rows lighter than this are narrowed instead of stretched

const ratioOf = (img: Img) => {
  const [w, h] = (img.ratio ?? "4 / 3").split("/").map((n) => Number(n.trim()));
  return w > 0 && h > 0 ? w / h : 4 / 3;
};

function toRows(images: Img[]) {
  const rows: { img: Img; r: number; i: number }[][] = [];
  let row: (typeof rows)[number] = [];
  let sum = 0;
  images.forEach((img, i) => {
    const r = ratioOf(img);
    if (row.length && (sum + r > MAX_ROW || row.length === MAX_ITEMS)) {
      rows.push(row);
      row = [];
      sum = 0;
    }
    row.push({ img, r, i });
    sum += r;
  });
  if (row.length) rows.push(row);
  return rows;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function Gallery({ images }: { images: Img[] }) {
  const shown = images.filter((i) => i.src);
  const [open, setOpen] = useState<number | null>(null);
  if (!shown.length) return null;

  return (
    <>
      <div className="flex flex-col gap-4 md:gap-6">
        {toRows(shown).map((row, k) => {
          const sum = row.reduce((s, x) => s + x.r, 0);
          const width = sum < MIN_ROW ? `${(sum / MIN_ROW) * 100}%` : undefined;
          return (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, ease }}
              className="flex flex-col gap-4 md:mx-auto md:w-[var(--row-w)] md:flex-row md:gap-6"
              style={{ "--row-w": width ?? "100%" } as React.CSSProperties}
            >
              {row.map(({ img, r, i }) => (
                <button
                  key={img.src + i}
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`View image ${i + 1} of ${shown.length}${img.alt ? `: ${img.alt}` : ""}`}
                  className="group relative w-full cursor-zoom-in overflow-hidden bg-bg-sunk md:w-auto md:flex-[var(--r)_1_0%]"
                  style={{ aspectRatio: img.ratio ?? "4 / 3", "--r": r } as React.CSSProperties}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes={`(min-width: 768px) ${Math.round((r / Math.max(sum, MIN_ROW)) * 90)}vw, 100vw`}
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]"
                  />
                </button>
              ))}
            </motion.div>
          );
        })}
      </div>
      {open !== null && (
        <Viewer images={shown} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

function Viewer({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: Img[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const many = images.length > 1;
  const go = useCallback(
    (d: 1 | -1) => onIndex((index + d + images.length) % images.length),
    [index, images.length, onIndex],
  );

  // Native modal dialog: traps focus, closes on Escape, returns focus afterwards.
  // Cleanup must not call close(): that fires onClose and would shut the viewer
  // straight after opening when React re-runs effects. Unmounting removes it anyway.
  useEffect(() => {
    const el = dialog.current;
    const opener = document.activeElement as HTMLElement | null;
    if (el && !el.open) el.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      opener?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!many) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [go, many]);

  const img = images[index];

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-label="Image viewer"
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-[#0d0d0c]/95 p-0 text-[#ececea] backdrop:bg-transparent"
    >
      <div className="flex h-full flex-col" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6">
          <span className="font-mono text-sm text-[#9b9b96]" aria-live="polite">
            {many ? `${index + 1} / ${images.length}` : ""}
          </span>
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="Close"
            className="inline-flex size-11 items-center justify-center transition-colors hover:bg-white/10"
          >
            <X size={22} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 px-4 md:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div
            key={img.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="relative size-full"
          >
            <Image src={img.src} alt={img.alt} fill sizes="100vw" className="object-contain" />
          </motion.div>

          {many && (
            <>
              <NavButton side="left" onClick={() => go(-1)} />
              <NavButton side="right" onClick={() => go(1)} />
            </>
          )}
        </div>

        <p className="min-h-16 shrink-0 px-4 py-5 text-center text-sm text-[#9b9b96] md:px-6">{img.alt}</p>
      </div>
    </dialog>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={`absolute top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center bg-[#0d0d0c]/60 transition-colors hover:bg-white/15 ${
        side === "left" ? "left-2 md:left-5" : "right-2 md:right-5"
      }`}
    >
      <Icon size={22} />
    </button>
  );
}
