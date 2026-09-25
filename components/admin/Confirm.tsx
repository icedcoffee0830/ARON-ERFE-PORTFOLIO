"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { easeIn, easeOut } from "@/lib/motion";

/*
  In-editor replacement for window.confirm(), which can't be styled or animated.
  `const ok = await confirm({ ... })` resolves true/false.

  Motion follows the editor's tool context: quick and quiet (under 250ms), a small
  scale-and-fade in, an even shorter fade out. Closing from the keyboard (Escape, or
  Enter/Space on a button) is instant: keyboard actions should never wait on motion.
  Escape and clicking outside cancel;
  focus starts on Cancel so an accidental Enter never confirms a destructive action.
*/

type Options = {
  title: string;
  message?: string;
  confirmLabel: string;
  destructive?: boolean;
};

type Request = Options & { resolve: (ok: boolean) => void };

const ConfirmContext = createContext<((o: Options) => Promise<boolean>) | null>(null);

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used inside <ConfirmProvider>.");
  return confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null);
  // Read by the exit animation (via AnimatePresence `custom`) after the dialog unmounts.
  const [instant, setInstant] = useState(false);
  // Whatever had focus when confirm() was called gets it back after the exit animation.
  const opener = useRef<HTMLElement | null>(null);

  const confirm = useCallback(
    (o: Options) =>
      new Promise<boolean>((resolve) => {
        opener.current = document.activeElement as HTMLElement | null;
        setRequest({ ...o, resolve });
      }),
    [],
  );

  const settle = (ok: boolean, byKeyboard = false) => {
    setInstant(byKeyboard);
    request?.resolve(ok);
    setRequest(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence custom={instant}>
        {request && <Dialog key="confirm" request={request} onSettle={settle} returnFocus={opener} />}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

const backdrop = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.15, ease: easeOut } },
  exit: (instant: boolean) => ({ opacity: 0, transition: { duration: instant ? 0 : 0.12, ease: easeIn } }),
};

function Dialog({
  request,
  onSettle,
  returnFocus,
}: {
  request: Request;
  onSettle: (ok: boolean, byKeyboard?: boolean) => void;
  returnFocus: React.RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
    // Runs on unmount, after the exit animation, once the dialog has left the page
    // (while it's still an open modal, everything else is inert and can't take focus).
    const target = returnFocus;
    return () => target.current?.focus({ preventScroll: true });
  }, [returnFocus]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby={request.message ? "confirm-message" : undefined}
      // Escape: cancel through state so the exit animation plays.
      onCancel={(e) => {
        e.preventDefault();
        onSettle(false, true);
      }}
      onClick={(e) => e.target === e.currentTarget && onSettle(false)}
      className="m-0 flex h-[100dvh] max-h-none w-screen max-w-none items-center justify-center bg-transparent p-4 text-fg backdrop:bg-transparent"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#0d0d0c]/50"
        variants={backdrop}
        initial="hidden"
        animate="shown"
        exit="exit"
      />
      <motion.div
        role="document"
        className="relative w-full max-w-[400px] border border-line bg-bg p-6 shadow-[0_24px_64px_-24px_rgb(0_0_0/0.5)]"
        variants={{
          hidden: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 6 },
          shown: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.25, bounce: 0 } },
          exit: (instant: boolean) =>
            instant
              ? { opacity: 0, transition: { duration: 0 } }
              : reduce
                ? { opacity: 0, transition: { duration: 0.1 } }
                : { opacity: 0, scale: 0.98, transition: { duration: 0.12, ease: easeIn } },
        }}
        initial="hidden"
        animate="shown"
        exit="exit"
      >
        <h2 id="confirm-title" className="text-lg font-semibold tracking-tight">
          {request.title}
        </h2>
        {request.message && (
          <p id="confirm-message" className="mt-2 text-sm leading-relaxed text-muted">
            {request.message}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={(e) => onSettle(false, e.detail === 0)}
            className="inline-flex h-10 items-center border border-line px-4 text-sm font-medium transition-colors hover:border-fg active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => onSettle(true, e.detail === 0)}
            className={`inline-flex h-10 items-center px-4 text-sm font-medium transition-colors active:scale-[0.98] ${
              request.destructive ? "bg-accent text-on-accent hover:bg-accent/90" : "bg-fg text-bg hover:bg-fg/85"
            }`}
          >
            {request.confirmLabel}
          </button>
        </div>
      </motion.div>
    </dialog>
  );
}
