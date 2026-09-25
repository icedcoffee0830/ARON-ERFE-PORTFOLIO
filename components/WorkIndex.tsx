"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import type { Discipline } from "@/content/projects";

export type WorkItem = {
  slug: string;
  title: string;
  discipline: Discipline;
  year: number;
  cover: { src: string; alt: string };
  /** Cover aspect ratio, e.g. "16 / 9". */
  ratio: string;
};

type Filter = Discipline | "all";

const ease = [0.16, 1, 0.3, 1] as const;


const ratioNum = (r: string) => {
  const [w, h] = r.split("/").map((n) => Number(n.trim()));
  return w > 0 && h > 0 ? w / h : 1;
};

export function WorkIndex({
  items,
  labels,
}: {
  items: WorkItem[];
  labels: Record<Discipline, string>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = filter === "all" ? items : items.filter((p) => p.discipline === filter);
  const track = useRef<HTMLUListElement>(null);
  const [ends, setEnds] = useState({ start: true, end: false });

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: items.length },
    ...(Object.keys(labels) as Discipline[]).map((d) => ({
      key: d,
      label: labels[d],
      count: items.filter((p) => p.discipline === d).length,
    })),
  ];

  // Only the two booleans live in state, and only update when they change.
  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const start = el.scrollLeft <= 2;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    setEnds((e) => (e.start === start && e.end === end ? e : { start, end }));
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [measure, shown.length]);

  function pick(f: Filter) {
    setFilter(f);
    track.current?.scrollTo({ left: 0, behavior: "smooth" });
  }

  function page(dir: 1 | -1) {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  // Mouse drag to scroll. Touch and trackpads already scroll natively.
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !track.current) return;
    drag.current = { down: true, x: e.clientX, left: track.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = track.current;
    if (!d.down || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      el.setPointerCapture(e.pointerId);
      el.style.scrollSnapType = "none";
      el.style.cursor = "grabbing";
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const el = track.current;
    if (el) {
      el.style.scrollSnapType = "";
      el.style.cursor = "";
    }
    drag.current.down = false;
  };
  // A drag must not also open the project under the pointer.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <section id="work" className="pb-24 pt-16 md:pb-32 md:pt-20">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
          <h2 className="text-4xl font-semibold tracking-[-0.035em] md:text-5xl">Work</h2>
          {items.length > 0 && (
            <div className="flex items-center gap-4">
              <div
                role="group"
                aria-label="Filter by discipline"
                className="-mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
              >
                {tabs.map((t) => {
                  const on = filter === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => pick(t.key)}
                      className={`inline-flex h-10 shrink-0 items-center gap-2 border px-4 text-sm transition-colors duration-200 active:scale-[0.98] ${
                        on
                          ? "border-fg bg-fg text-bg"
                          : "border-line text-muted hover:border-fg hover:text-fg"
                      }`}
                    >
                      {t.label}
                      <span className={`font-mono text-xs ${on ? "text-bg/70" : "text-muted"}`}>
                        {t.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {items.length === 0 && (
          <div className="mt-16 max-w-[48ch]">
            <p className="text-2xl font-medium tracking-tight">New work is on its way.</p>
            <p className="mt-3 text-muted">
              Projects are being prepared for this page. In the meantime, the contact details
              below are the quickest way to see more.
            </p>
          </div>
        )}
      </div>

      {/* The track lines up with the page content (same gutters as the 1400px container) and runs to the screen edge. */}
      {items.length > 0 && (
        <div className="relative mt-12 md:mt-16">
        <ul
          ref={track}
          aria-label="Projects"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
          onDragStart={(e) => e.preventDefault()}
          className="flex snap-x snap-mandatory items-start gap-5 overflow-x-auto overscroll-x-contain px-4 pb-4 scroll-px-4 [scrollbar-width:none] md:cursor-grab md:gap-8 md:px-[max(2rem,calc((100%_-_1400px)/2_+_2rem))] md:scroll-px-[max(2rem,calc((100%_-_1400px)/2_+_2rem))] [&::-webkit-scrollbar]:hidden"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p, i) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5, ease }}
                className="shrink-0 snap-start"
              >
                <Card item={p} label={labels[p.discipline]} priority={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {/* Centred on the images (the caption and padding below add about 5.5rem). */}
        <ArrowButton side="left" label="Previous projects" hidden={ends.start} onClick={() => page(-1)} />
        <ArrowButton side="right" label="More projects" hidden={ends.end} onClick={() => page(1)} />
        </div>
      )}
    </section>
  );
}

function ArrowButton({
  side,
  label,
  hidden,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  hidden: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      aria-label={label}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      onClick={onClick}
      className={`absolute top-[calc(50%-2.75rem)] z-10 inline-flex size-12 -translate-y-1/2 items-center justify-center border border-line bg-bg/90 text-fg shadow-[0_12px_32px_-14px_rgb(0_0_0/0.55)] backdrop-blur-sm transition-[opacity,background-color,border-color] duration-300 hover:border-fg hover:bg-bg active:scale-[0.96] md:size-14 ${
        side === "left" ? "left-2 md:left-6" : "right-2 md:right-6"
      } ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <Icon size={22} weight="bold" />
    </button>
  );
}

function Card({ item, label, priority }: { item: WorkItem; label: string; priority: boolean }) {
  const r = ratioNum(item.ratio);
  // Every card shares one height so shapes sit side by side at their true proportions.
  // On narrow screens wide covers shrink so they never exceed 85% of the screen width.
  const height = `min(clamp(300px, 52vh, 560px), calc(85vw / ${r}))`;
  return (
    <Link href={`/work/${item.slug}`} className="group block select-none" draggable={false}>
      <div
        className="relative overflow-hidden bg-bg-sunk"
        style={{ height, aspectRatio: item.ratio }}
      >
        <Image
          src={item.cover.src}
          alt={item.cover.alt}
          fill
          priority={priority}
          draggable={false}
          sizes="(min-width: 768px) 50vw, 85vw"
          className="pointer-events-none object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.035]"
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-6" style={{ width: `calc(${height} * ${r})` }}>
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-lg font-medium tracking-tight md:text-xl">
            <span className="truncate">{item.title}</span>
            <ArrowUpRight
              aria-hidden
              size={18}
              weight="bold"
              className="shrink-0 -translate-x-1 text-accent opacity-0 transition-all duration-300 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100"
            />
          </h3>
          <p className="mt-1 text-sm text-muted">{label}</p>
        </div>
        <span className="shrink-0 font-mono text-sm text-muted">{item.year}</span>
      </div>
    </Link>
  );
}
