"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PencilSimple } from "@phosphor-icons/react";

/*
  Shows an Edit button on the public site only for the signed-in owner.
  It reads a harmless hint cookie set at login, so visitors trigger no extra requests.
  The editor itself still checks the real session.
*/
export function EditLink() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(document.cookie.split("; ").includes("pf_admin_hint=1"));
  }, []);

  if (!show) return null;
  const slug = pathname.match(/^\/work\/([^/]+)/)?.[1];
  const href = slug ? `/admin?project=${encodeURIComponent(slug)}` : "/admin";

  return (
    <Link
      href={href}
      className="fixed bottom-5 right-5 z-40 inline-flex h-11 items-center gap-2 bg-fg px-4 text-sm font-medium text-bg shadow-[0_12px_32px_-12px_rgb(20_20_20/0.5)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <PencilSimple size={16} weight="bold" />
      {slug ? "Edit project" : "Edit site"}
    </Link>
  );
}
