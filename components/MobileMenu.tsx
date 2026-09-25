"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";

/*
  Phone navigation: a "Menu" button that opens a full-screen sheet with large links.
  Closes on link tap, Escape, or route change; locks page scroll while open and
  returns focus to the button afterwards. The sheet is portalled to <body>: the
  header's backdrop blur would otherwise trap a fixed overlay inside the 64px bar.
*/
export function MobileMenu({
  items,
  email,
}: {
  items: { href: string; label: string }[];
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const trigger = button.current;
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex h-10 items-center border border-line px-4 text-sm font-medium transition-colors hover:border-fg active:scale-[0.98] md:hidden"
      >
        Menu
      </button>

      {mounted &&
        createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-bg px-4 md:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-end">
              <button
                ref={close}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex size-10 items-center justify-center border border-line transition-colors hover:border-fg"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center pb-16">
              <ul className="flex flex-col gap-2">
                {items.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block py-2 text-5xl font-semibold tracking-[-0.04em] transition-colors active:text-accent"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <a href={`mailto:${email}`} className="mt-12 break-all text-muted underline decoration-line underline-offset-4">
                {email}
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
