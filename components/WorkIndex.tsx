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
  const [current, setCurrent] = useState(0);

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: items.length },
    ...(Object.keys(labels) as Discipline[]).map((d) => ({
      key: d,
      label: labels[d],
      count: items.filter((p) => p.discipline === d).length,
    })),
  ];

  // Only discrete values live in state (ends, centred index), updated only when they change.
  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const start = el.scrollLeft <= 2;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    setEnds((e) => (e.start === start && e.end === end ? e : { start, end }));
    const i = centred();
    setCurrent((c) => (c === i ? c : i));
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

  // Cards in the current filter, looked up by project. Cards still fading out from
  // the previous filter stay in the DOM briefly and must not be counted.
  const slugs = useRef<string[]>([]);
  slugs.current = shown.map((p) => p.slug);
  const cards = () =>
    slugs.current
      .map((slug) => track.current?.querySelector<HTMLElement>(`li[data-card="${slug}"]`))
      .filter((c): c is HTMLElement => Boolean(c));

  // Scrolls so card i sits in the middle of the track. The track is `relative`, so card
  // offsets are measured in its own scroll coordinates rather than the scrolled view.
  const centerOn = useCallback((i: number, behavior: ScrollBehavior) => {
    const el = track.current;
    const card = cards()[i];
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - el.clientWidth / 2, behavior });
  }, []);

  // The card currently closest to the middle.
  function centred() {
    const el = track.current;
    if (!el) return 0;
    const mid = el.scrollLeft + el.clientWidth / 2;
    const dist = cards().map((c) => Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid));
    return dist.indexOf(Math.min(...dist));
  }

  // Open on the middle project, so there is work on both sides. Re-centre when the filter changes.
  const first = useRef(true);
  useEffect(() => {
    const behavior: ScrollBehavior = first.current ? "instant" : "smooth";
    first.current = false;
    const id = requestAnimationFrame(() => centerOn(Math.floor((shown.length - 1) / 2), behavior));
    return () => cancelAnimationFrame(id);
  }, [filter, shown.length, centerOn]);

  function pick(f: Filter) {
    setFilter(f);
  }

  function page(dir: 1 | -1) {
    centerOn(Math.min(Math.max(centred() + dir, 0), shown.length - 1), "smooth");
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
    <section id="work" className="pb-16 pt-12 md:pb-32 md:pt-20">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
          <h2 className="text-4xl font-semibold tracking-[-0.035em] md:text-5xl">Work</h2>
          {items.length > 0 && (
            <div className="flex items-center gap-4">
              <div
                role="group"
                aria-label="Filter by discipline"
                className="flex min-w-0 flex-wrap gap-2"
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

      {/* Full-width track; the centred card is the focus, with neighbours visible on both sides. Side padding lets the first and last cards reach the middle. */}
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
          className="relative flex snap-x snap-mandatory items-start gap-5 overflow-x-auto overscroll-x-contain px-[7.5vw] pb-4 [scrollbar-width:none] md:cursor-grab md:gap-8 md:px-[calc(50%_-_280px)] [&::-webkit-scrollbar]:hidden"
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
                data-card={p.slug}
                className="shrink-0 snap-center"
              >
                <Card item={p} label={labels[p.discipline]} priority={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {/* Centred on the images (the caption and padding below add about 5.5rem). */}
        <ArrowButton side="left" label="Previous projects" hidden={ends.start} onClick={() => page(-1)} />
        <ArrowButton side="right" label="More projects" hidden={ends.end} onClick={() => page(1)} />
        {/* Phones: position and arrows sit below the row instead of over the images. */}
        <div className="mt-2 flex items-center justify-between px-4 md:hidden">
          <span className="font-mono text-sm text-muted" aria-live="polite">
            {Math.min(current + 1, shown.length)} / {shown.length}
          </span>
          <div className="flex gap-2">
            <SmallArrow label="Previous project" disabled={ends.start} onClick={() => page(-1)}>
              <ArrowLeft size={18} weight="bold" />
            </SmallArrow>
            <SmallArrow label="Next project" disabled={ends.end} onClick={() => page(1)}>
              <ArrowRight size={18} weight="bold" />
            </SmallArrow>
          </div>
        </div>
        </div>
      )}
    </section>
  );
}

function SmallArrow({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center border border-line transition-colors active:scale-[0.96] active:border-fg disabled:opacity-35"
    >
      {children}
    </button>
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
      className={`absolute top-[calc(50%-2.75rem)] z-10 hidden size-12 -translate-y-1/2 items-center justify-center border border-line bg-bg/90 text-fg shadow-[0_12px_32px_-14px_rgb(0_0_0/0.55)] backdrop-blur-sm transition-[opacity,background-color,border-color] duration-300 hover:border-fg hover:bg-bg active:scale-[0.96] md:inline-flex md:size-14 ${
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
