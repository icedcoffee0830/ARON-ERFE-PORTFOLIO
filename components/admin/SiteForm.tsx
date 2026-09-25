"use client";

import { Plus, Trash } from "@phosphor-icons/react";
import type { Site } from "@/content/site";
import { AboutFields } from "./AboutFields";
import { ImageField } from "./ImageField";
import { Button, IconButton, TextArea, TextInput, Toggle } from "./ui";

export function SiteForm({ site, onChange }: { site: Site; onChange: (s: Site) => void }) {
  const set = <K extends keyof Site>(k: K, v: Site[K]) => onChange({ ...site, [k]: v });
  const setLink = (i: number, patch: Partial<Site["links"][number]>) =>
    set("links", site.links.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-0.03em]">Site details</h1>
        <p className="mt-1 text-sm text-muted">Your name, introduction and contact details.</p>
      </header>

      <section className="flex flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <TextInput label="Name" hint="Shown in the menu bar and browser tab." value={site.name} onChange={(v) => set("name", v)} />
          <TextInput label="Role" hint="Shown in the browser tab, e.g. Designer." value={site.role} onChange={(v) => set("role", v)} />
        </div>
        <TextArea
          label="Introduction"
          hint="The sentence under the big headline at the top of the home page. Keep it to about 20 words."
          rows={2}
          value={site.intro}
          onChange={(v) => set("intro", v)}
        />
        <TextArea
          label="About statement"
          hint="The large paragraph in the About section. Two or three sentences in your own words."
          rows={4}
          value={site.statement}
          onChange={(v) => set("statement", v)}
        />
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">About details</h2>
          <p className="mt-1 text-sm text-muted">Shown in the About section, below your statement. Leave any part empty to hide it.</p>
        </div>
        <AboutFields site={site} onChange={onChange} />
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Logo</h2>
          <p className="mt-1 text-sm text-muted">
            Shown at the top left of every page, 32px tall. Without a logo, your name is shown instead.
            SVG gives the sharpest result; a PNG with a transparent background also works.
          </p>
        </div>
        <ImageField
          label="Logo"
          value={{ src: site.logo ?? "", alt: site.name }}
          folder="logo"
          fixedRatio="3 / 1"
          fit="contain"
          tone="light"
          showAlt={false}
          accept="image/svg+xml,image/png,image/webp,image/jpeg"
          fixedRatioNote="Previewed on the light background."
          onChange={(v) => set("logo", v.src || null)}
        />
        <ImageField
          label="Logo for dark mode (optional)"
          value={{ src: site.logoDark ?? "", alt: site.name }}
          folder="logo-dark"
          fixedRatio="3 / 1"
          fit="contain"
          tone="dark"
          showAlt={false}
          accept="image/svg+xml,image/png,image/webp,image/jpeg"
          fixedRatioNote="Visitors whose device is in dark mode see this version. Upload a light-coloured logo here if your main one is dark."
          onChange={(v) => set("logoDark", v.src || null)}
        />
        {site.logo && (
          <Toggle
            label="Show your name next to the logo"
            checked={site.showNameWithLogo}
            onChange={(v) => set("showNameWithLogo", v)}
          />
        )}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold tracking-tight">Portrait</h2>
        <ImageField
          label="Portrait (optional)"
          value={{ src: site.portrait ?? "", alt: `Portrait of ${site.name}` }}
          folder="portrait"
          fixedRatio="4 / 5"
          fixedRatioNote="Shown next to your statement, cropped to 4:5. Remove it to hide the portrait."
          onChange={(v) => set("portrait", v.src || null)}
        />
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold tracking-tight">Contact</h2>
        <TextInput
          label="Email"
          type="email"
          value={site.email}
          onChange={(v) => set("email", v.trim())}
          placeholder="you@example.com"
        />
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Profile links</p>
          {site.links.length === 0 && (
            <p className="text-[13px] text-muted">None yet. Add LinkedIn, Behance, Instagram or similar.</p>
          )}
          {site.links.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] items-end gap-2 sm:grid-cols-[180px_1fr_auto]">
              <TextInput label="Label" value={l.label} onChange={(v) => setLink(i, { label: v })} placeholder="Behance" />
              <div className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
                <TextInput label="Address" value={l.href} onChange={(v) => setLink(i, { href: v.trim() })} placeholder="https://" />
              </div>
              <IconButton
                label="Remove link"
                className="mb-0.5 size-10 hover:text-accent"
                onClick={() => set("links", site.links.filter((_, j) => j !== i))}
              >
                <Trash size={16} />
              </IconButton>
            </div>
          ))}
          <div>
            <Button onClick={() => set("links", [...site.links, { label: "", href: "https://" }])}>
              <Plus size={16} weight="bold" /> Add link
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
