"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Discipline } from "@/content/projects";

export type HeroCover = {
  discipline: Discipline;
  slug: string;
  title: string;
  src: string;
  alt: string;
  ratio: string;
};

// Where each discipline's cover sits in the cluster, and its resting stack order.
const placement: Record<Discipline, { className: string; z: number }> = {
  ui: { className: "right-0 top-0 w-[62%]", z: 10 },
  brand: { className: "left-0 top-[20%] w-[46%]", z: 20 },
  print: { className: "left-[34%] bottom-0 w-[36%]", z: 25 },
};

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero({
  intro,
  words,
  covers,
}: {
  intro: string;
  words: Record<Discipline, string>;
  covers: HeroCover[];
}) {
  const [active, setActive] = useState<Discipline | null>(null);
  // Entrance delays apply once; after that, hover responses are immediate.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), 1300);
    return () => clearTimeout(t);
  }, []);
  const has = (d: Discipline) => covers.some((c) => c.discipline === d);

  const enter = (i: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: 0.08 * i, ease },
  });

  // A headline word is interactive only when there is a cover to point at.
  const word = (d: Discipline) =>
    has(d) ? (
      <span
        onPointerEnter={() => setActive(d)}
        onPointerLeave={() => setActive(null)}
        className={`cursor-default transition-colors duration-300 ${
          active === d ? "text-accent" : ""
        }`}
      >
        {words[d]}
      </span>
    ) : (
      <span>{words[d]}</span>
    );

  return (
    <section className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-4 pb-8 pt-12 md:px-8 lg:grid-cols-12 lg:gap-8 lg:pb-12 lg:pt-20">
      <div className={covers.length ? "lg:col-span-7" : "lg:col-span-10"}>
        <motion.h1
          {...enter(0)}
          className="text-sheen pb-2 text-[clamp(2.75rem,5.6vw,5.75rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
        >
          {word("brand")}, {word("ui")} and {word("print")}.
        </motion.h1>
        <motion.p
          {...enter(1)}
          className="mt-8 max-w-[34ch] text-lg leading-relaxed text-muted md:text-xl"
        >
          {intro}
        </motion.p>
        <motion.div {...enter(2)} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            href="#work"
            className="inline-flex h-12 items-center bg-fg px-6 font-medium text-bg transition-transform duration-200 ease-out-expo hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            View work
          </Link>
          <Link
            href="#contact"
            className="font-medium underline decoration-line decoration-2 underline-offset-[6px] transition-colors hover:decoration-accent"
          >
            Contact
          </Link>
        </motion.div>
      </div>

      {covers.length > 0 && (
        <div className="relative mx-auto aspect-[6/5] w-full max-w-[560px] lg:col-span-5 lg:max-w-none">
          {covers.map((c, i) => {
            const p = placement[c.discipline];
            const isActive = active === c.discipline;
            return (
              <motion.div
                key={c.slug}
                className={`absolute ${p.className}`}
                style={{ zIndex: isActive ? 30 : p.z }}
                initial={{ opacity: 0, y: 48 }}
                animate={{
                  opacity: active && !isActive ? 0.55 : 1,
                  y: 0,
                  scale: isActive ? 1.03 : 1,
                }}
                transition={
                  settled
                    ? { duration: 0.45, ease }
                    : { duration: 0.8, delay: 0.25 + i * 0.1, ease }
                }
              >
                <Link
                  href={`/work/${c.slug}`}
                  onPointerEnter={() => setActive(c.discipline)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(c.discipline)}
                  onBlur={() => setActive(null)}
                  className="block"
                  aria-label={c.title}
                >
                  <div
                    className="relative overflow-hidden bg-bg-sunk shadow-[0_24px_60px_-28px_rgb(20_20_20/0.45)]"
                    style={{ aspectRatio: c.ratio }}
                  >
                    <Image
                      src={c.src}
                      alt={c.alt}
                      fill
                      priority
                      sizes="(min-width: 1024px) 26vw, 60vw"
                      className="object-cover"
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
