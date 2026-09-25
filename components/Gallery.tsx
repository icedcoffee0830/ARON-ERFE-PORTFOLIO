"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { easeIn, easeOut, springSoft } from "@/lib/motion";
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


export function Gallery({ images }: { images: Img[] }) {
  const shown = images.filter((i) => i.src);
  const [open, setOpen] = useState<number | null>(null);
  // Where the viewer grows from: the tapped image's centre, in viewport percentages.
  const [origin, setOrigin] = useState("50% 50%");
  // The thumbnail that opened the viewer gets focus back when the viewer unmounts.
  const opener = useRef<HTMLElement | null>(null);
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
              transition={{ duration: 0.8, ease: easeOut }}
              className="flex flex-col gap-4 md:mx-auto md:w-[var(--row-w)] md:flex-row md:gap-6"
              style={{ "--row-w": width ?? "100%" } as React.CSSProperties}
            >
              {row.map(({ img, r, i }) => (
                <button
                  key={img.src + i}
                  type="button"
                  onClick={(e) => {
                    opener.current = e.currentTarget;
                    const r = e.currentTarget.getBoundingClientRect();
                    setOrigin(`${((r.left + r.width / 2) / window.innerWidth) * 100}% ${((r.top + r.height / 2) / window.innerHeight) * 100}%`);
                    setOpen(i);
                  }}
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
      {/* Kept mounted through its exit animation, then removed. */}
      <AnimatePresence>
        {open !== null && (
          <Viewer
            key="viewer"
            images={shown}
            index={open}
            origin={origin}
            returnFocus={opener}
            onIndex={setOpen}
            onClose={() => setOpen(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Viewer({
  images,
  index,
  origin,
  returnFocus,
  onIndex,
  onClose,
}: {
  images: Img[];
  index: number;
  origin: string;
  returnFocus: React.RefObject<HTMLElement | null>;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduce = useReducedMotion();
  const many = images.length > 1;
  const go = useCallback(
    (d: 1 | -1) => onIndex((index + d + images.length) % images.length),
    [index, images.length, onIndex],
  );

  // Native modal dialog: traps focus; on unmount (after the exit animation, once the
  // dialog has left the page and nothing is inert) focus returns to the thumbnail. Escape is routed
  // through onClose (see onCancel) so the exit animation plays instead of a hard close.
  // Cleanup must not call close(): that fires onClose and would shut the viewer
  // straight after opening when React re-runs effects. Unmounting removes it anyway.
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const target = returnFocus;
    return () => {
      document.body.style.overflow = prev;
      target.current?.focus({ preventScroll: true });
    };
  }, [returnFocus]);

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
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
      aria-label="Image viewer"
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-transparent p-0 text-[#ececea] backdrop:bg-transparent"
    >
      {/* Backdrop: fades up on open, fades out a little faster on close. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[#0d0d0c]/95"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.3, ease: easeOut } }}
        exit={{ opacity: 0, transition: { duration: 0.22, ease: easeIn } }}
      />
      <div className="relative flex h-full flex-col" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div
          className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.25, delay: reduce ? 0 : 0.1 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
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
        </motion.div>

        <div className="relative min-h-0 flex-1 px-4 md:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
          {/* The image grows out of the thumbnail that was tapped and comes into focus.
              Exit is smaller and quicker than the enter. */}
          <motion.div
            className="relative size-full"
            style={{ transformOrigin: origin }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: springSoft }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.15 } }
                : { opacity: 0, scale: 0.98, filter: "blur(2px)", transition: { duration: 0.18, ease: easeIn } }
            }
          >
            {/* Stepping between images (often by keyboard) is a quick crossfade only. */}
            <AnimatePresence initial={false}>
              <motion.div
                key={img.src}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
              >
                <Image src={img.src} alt={img.alt} fill sizes="100vw" className="object-contain" />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {many && (
            <>
              <NavButton side="left" onClick={() => go(-1)} />
              <NavButton side="right" onClick={() => go(1)} />
            </>
          )}
        </div>

        <motion.p
          className="min-h-16 shrink-0 px-4 py-5 text-center text-sm text-[#9b9b96] md:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.25, delay: 0.15 } }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          {img.alt}
        </motion.p>
      </div>
    </dialog>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ArrowLeft : ArrowRight;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.25, delay: 0.15 } }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={`absolute top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center bg-[#0d0d0c]/60 transition-colors hover:bg-white/15 ${
        side === "left" ? "left-2 md:left-5" : "right-2 md:right-5"
      }`}
    >
      <Icon size={22} />
    </motion.button>
  );
}
