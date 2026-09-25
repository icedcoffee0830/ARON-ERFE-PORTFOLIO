"use client";

import { useState } from "react";
import { WarningCircle } from "@phosphor-icons/react";
import { inputClass } from "./ui";

export function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      window.location.reload();
      return;
    }
    const data = await res?.json().catch(() => ({}));
    setError(data?.error ?? "Could not reach the server. Try again.");
    setBusy(false);
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-[400px] flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">Editor</h1>
      <p className="mt-2 text-muted">Sign in to edit your site.</p>
      <form onSubmit={submit} className="mt-10 flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "password-error" : undefined}
          className={inputClass}
        />
        {error && (
          <p id="password-error" role="alert" className="flex items-center gap-2 text-[13px] text-accent">
            <WarningCircle size={16} className="shrink-0" />
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-4 inline-flex h-12 items-center justify-center bg-fg px-6 font-medium text-bg transition-colors hover:bg-fg/85 active:scale-[0.98] disabled:bg-line disabled:text-muted"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
