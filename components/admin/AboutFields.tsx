"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Plus, Trash, X } from "@phosphor-icons/react";
import type { Site } from "@/content/site";
import { abbrOf, softwarePresets } from "@/lib/software";
import { Button, IconButton, TextArea, TextInput, inputClass } from "./ui";

type Experience = Site["experience"][number];

export function AboutFields({ site, onChange }: { site: Site; onChange: (s: Site) => void }) {
  const skills = site.skills ?? [];
  const experience = site.experience ?? [];
  const software = site.software ?? [];

  const setExp = (next: Experience[]) => onChange({ ...site, experience: next });
  const patchExp = (i: number, patch: Partial<Experience>) =>
    setExp(experience.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const moveExp = (i: number, d: -1 | 1) => {
    const next = [...experience];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setExp(next);
  };

  return (
    <div className="flex flex-col gap-10">
      <TextArea
        label="Soft skills"
        hint="One per line, e.g. Team-Oriented. Shown as tags."
        rows={5}
        value={skills.join("\n")}
        onChange={(v) => onChange({ ...site, skills: v.split("\n") })}
      />

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Experience</p>
        <p className="-mt-1 text-[13px] text-muted">Shown top to bottom. Put the most recent or most important first.</p>
        {experience.length === 0 && (
          <p className="border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            No experience added yet.
          </p>
        )}
        <ol className="flex flex-col gap-3">
          {experience.map((e, i) => (
            <li key={i} className="border border-line">
              <div className="flex items-center justify-between border-b border-line py-1 pl-4 pr-1">
                <span className="truncate text-sm font-medium">{e.title || `Entry ${i + 1}`}</span>
                <div className="flex">
                  <IconButton label="Move up" disabled={i === 0} onClick={() => moveExp(i, -1)}>
                    <ArrowUp size={16} />
                  </IconButton>
                  <IconButton label="Move down" disabled={i === experience.length - 1} onClick={() => moveExp(i, 1)}>
                    <ArrowDown size={16} />
                  </IconButton>
                  <IconButton
                    label="Remove entry"
                    className="hover:text-accent"
                    onClick={() => setExp(experience.filter((_, j) => j !== i))}
                  >
                    <Trash size={16} />
                  </IconButton>
                </div>
              </div>
              <div className="grid gap-4 p-4 sm:grid-cols-[1fr_140px]">
                <TextInput
                  label="Title"
                  value={e.title}
                  onChange={(title) => patchExp(i, { title })}
                  placeholder="e.g. Graphic Design Intern"
                />
                <TextInput
                  label="Year (optional)"
                  value={e.period ?? ""}
                  onChange={(period) => patchExp(i, { period })}
                  placeholder="e.g. 2024"
                />
                <div className="sm:col-span-2">
                  <TextInput
                    label="Details (optional)"
                    value={e.detail ?? ""}
                    onChange={(detail) => patchExp(i, { detail })}
                    placeholder="e.g. GoRide Integrated Systems Corporation"
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div>
          <Button onClick={() => setExp([...experience, { title: "" }])}>
            <Plus size={16} weight="bold" /> Add experience
          </Button>
        </div>
      </div>

      <SoftwarePicker value={software} onChange={(next) => onChange({ ...site, software: next })} />
    </div>
  );
}

function SoftwarePicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [other, setOther] = useState("");
  const has = (name: string) => value.some((v) => v.toLowerCase() === name.toLowerCase());
  const toggle = (name: string) => onChange(has(name) ? value.filter((v) => v.toLowerCase() !== name.toLowerCase()) : [...value, name]);
  const custom = value.filter((v) => !softwarePresets.some((p) => p.name.toLowerCase() === v.toLowerCase()));

  function addOther() {
    const name = other.trim();
    if (name && !has(name)) onChange([...value, name]);
    setOther("");
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Software</p>
      <p className="-mt-1 text-[13px] text-muted">Tap to add or remove. They appear in the order you pick them.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {softwarePresets.map((p) => {
          const on = has(p.name);
          return (
            <button
              key={p.name}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(p.name)}
              className={`flex items-center gap-3 border p-2 text-left text-sm transition-colors ${
                on ? "border-fg bg-bg-sunk" : "border-line hover:border-muted"
              }`}
            >
              <span
                aria-hidden
                className={`flex size-9 shrink-0 items-center justify-center border-2 text-sm font-semibold ${
                  on ? "border-fg" : "border-line text-muted"
                }`}
              >
                {p.abbr}
              </span>
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              {on && <Check size={16} weight="bold" className="shrink-0" />}
            </button>
          );
        })}
      </div>

      {custom.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {custom.map((name) => (
            <li key={name} className="flex items-center gap-2 border border-fg bg-bg-sunk py-1 pl-1 pr-1 text-sm">
              <span aria-hidden className="flex size-7 items-center justify-center border-2 border-fg text-xs font-semibold">
                {abbrOf(name)}
              </span>
              {name}
              <IconButton label={`Remove ${name}`} className="size-7" onClick={() => toggle(name)}>
                <X size={14} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          aria-label="Other software"
          placeholder="Other software, e.g. Spline"
          value={other}
          onChange={(e) => setOther(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addOther();
            }
          }}
          className={inputClass}
        />
        <Button onClick={addOther} disabled={!other.trim()}>
          <Plus size={16} weight="bold" /> Add
        </Button>
      </div>
    </div>
  );
}
