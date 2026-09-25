"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { Discipline } from "@/content/projects";

export type WorkItem = {
  slug: string;
  title: string;
  discipline: Discipline;
  year: number;
  cover: { src: string; alt: string };
};

type Filter = Discipline | "all";

/*
  Offset rhythm on desktop, repeating every four items:
  wide left, narrow right (dropped), narrow indented, medium right.
  Mobile is a single column in list order.
*/
const rhythm = [
  "md:col-span-7",
  "md:col-span-5 md:col-start-8 md:mt-40",
  "md:col-span-5 md:col-start-2",
  "md:col-span-6 md:col-start-7 md:mt-24",
];

const ease = [0.16, 1, 0.3, 1] as const;

export function WorkIndex({
  items,
  labels,
  ratios,
}: {
  items: WorkItem[];
  labels: Record<Discipline, string>;
  ratios: Record<Discipline, string>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = filter === "all" ? items : items.filter((p) => p.discipline === filter);

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: items.length },
    ...(Object.keys(labels) as Discipline[]).map((d) => ({
      key: d,
      label: labels[d],
      count: items.filter((p) => p.discipline === d).length,
    })),
  ];

  return (
    <section id="work" className="mx-auto max-w-[1400px] px-4 pb-24 pt-16 md:px-8 md:pb-32 md:pt-20">
      <div className="flex flex-col gap-8 border-t border-line pt-8 md:flex-row md:items-end md:justify-between">
        <h2 className="text-4xl font-semibold tracking-[-0.035em] md:text-5xl">Work</h2>
        {items.length > 0 && (
          <div
            role="group"
            aria-label="Filter by discipline"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
          >
            {tabs.map((t) => {
              const on = filter === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(t.key)}
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
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-16 max-w-[48ch]">
          <p className="text-2xl font-medium tracking-tight">New work is on its way.</p>
          <p className="mt-3 text-muted">
            Projects are being prepared for this page. In the meantime, the contact details
            below are the quickest way to see more.
          </p>
        </div>
      ) : (
        <LayoutGroup>
          <motion.ul layout className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:mt-20 md:grid-cols-12 md:gap-y-24">
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((p, i) => (
                <motion.li
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.6, ease }}
                  className={`self-start ${rhythm[i % rhythm.length]}`}
                >
                  <Card item={p} label={labels[p.discipline]} ratio={ratios[p.discipline]} priority={i < 2} />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>
      )}
    </section>
  );
}

function Card({
  item,
  label,
  ratio,
  priority,
}: {
  item: WorkItem;
  label: string;
  ratio: string;
  priority: boolean;
}) {
  return (
    <Link href={`/work/${item.slug}`} className="group block">
      <div className="relative overflow-hidden bg-bg-sunk" style={{ aspectRatio: ratio }}>
        <Image
          src={item.cover.src}
          alt={item.cover.alt}
          fill
          priority={priority}
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.035]"
        />
      </div>
      <div className="mt-4 flex items-start justify-between gap-6">
        <div>
          <h3 className="flex items-center gap-2 text-xl font-medium tracking-tight">
            {item.title}
            <ArrowUpRight
              aria-hidden
              size={18}
              weight="bold"
              className="-translate-x-1 text-accent opacity-0 transition-all duration-300 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100"
            />
          </h3>
          <p className="mt-1 text-sm text-muted">{label}</p>
        </div>
        <span className="font-mono text-sm text-muted">{item.year}</span>
      </div>
    </Link>
  );
}
