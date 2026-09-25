"use client";

import { useId } from "react";

/* Small form primitives shared by the editor. Square corners, site tokens. */

export const inputClass =
  "w-full border border-line bg-bg px-3 py-2.5 text-[15px] text-fg placeholder:text-muted/80 transition-colors hover:border-muted focus:border-fg focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-[13px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}

export function TextInput({
  label,
  hint,
  value,
  onChange,
  ...rest
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          {...rest}
        />
      )}
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      )}
    </Field>
  );
}

export function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <Field label={label}>
      {(id) => (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className={`${inputClass} cursor-pointer`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ variant = "secondary", className = "", ...rest }: ButtonProps) {
  const styles = {
    primary: "bg-fg text-bg hover:bg-fg/85 disabled:bg-line disabled:text-muted",
    secondary: "border border-line hover:border-fg disabled:text-muted disabled:hover:border-line",
    ghost: "text-muted hover:text-fg hover:bg-bg-sunk disabled:hover:bg-transparent",
    danger: "border border-line text-accent hover:border-accent",
  }[variant];
  return (
    <button
      type="button"
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 px-4 text-sm font-medium transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${styles} ${className}`}
      {...rest}
    />
  );
}

export function IconButton({
  label,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-9 shrink-0 items-center justify-center text-muted transition-colors hover:bg-bg-sunk hover:text-fg disabled:pointer-events-none disabled:opacity-35 ${className}`}
      {...rest}
    />
  );
}

export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 border transition-colors ${
          checked ? "border-fg bg-fg" : "border-line bg-bg-sunk"
        }`}
      >
        <span
          className={`absolute top-0.5 size-[18px] transition-all duration-200 ${
            checked ? "left-[22px] bg-bg" : "left-0.5 bg-muted"
          }`}
        />
      </button>
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-[13px] text-muted">{hint}</span>}
      </label>
    </div>
  );
}
