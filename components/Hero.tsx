"use client";

import Link from "next/link";
import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

/* Centred statement: headline, one-line intro and two actions over the dot field. */
export function Hero({ headline, intro }: { headline: string; intro: string }) {
  const enter = (i: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: 0.08 * i, ease },
  });

  return (
    <section className="mx-auto flex min-h-[64dvh] max-w-[1400px] flex-col items-center justify-center px-4 py-20 text-center md:min-h-[72dvh] md:px-8 md:py-24">
      <motion.h1
        {...enter(0)}
        className="text-sheen max-w-[14ch] pb-2 text-[clamp(2.75rem,7vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.045em]"
      >
        {headline}
      </motion.h1>
      <motion.p {...enter(1)} className="mt-8 max-w-[38ch] text-lg leading-relaxed text-muted md:text-xl">
        {intro}
      </motion.p>
      <motion.div {...enter(2)} className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
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
    </section>
  );
}
