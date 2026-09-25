"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

export function Contact({
  email,
  links,
}: {
  email: string;
  links: { label: string; href: string }[];
}) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  useEffect(() => {
    if (copied === "idle") return;
    const t = setTimeout(() => setCopied("idle"), 2200);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-28">
      <h2 className="text-4xl font-semibold tracking-[-0.035em] md:text-5xl">Contact</h2>
      <p className="mt-4 max-w-[44ch] text-lg text-muted">
        For projects, collaborations or just to talk about the work, email is best.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 md:mt-12">
        <a
          href={`mailto:${email}`}
          className="group break-all text-[clamp(1.5rem,3.2vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em]"
        >
          <span className="bg-[linear-gradient(var(--accent),var(--accent))] bg-[length:0%_0.06em] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 ease-out-expo group-hover:bg-[length:100%_0.06em]">
            {email}
          </span>
        </a>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-11 shrink-0 items-center gap-2 border border-line px-4 text-sm font-medium transition-colors hover:border-fg active:scale-[0.98]"
        >
          {copied === "done" ? (
            <Check aria-hidden size={16} weight="bold" className="text-accent" />
          ) : (
            <Copy aria-hidden size={16} weight="bold" />
          )}
          <span aria-live="polite">
            {copied === "done" ? "Copied" : copied === "failed" ? "Copy failed" : "Copy email"}
          </span>
        </button>
      </div>

      {links.length > 0 && (
        <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-3">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline decoration-line decoration-2 underline-offset-[6px] transition-colors hover:decoration-accent"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
