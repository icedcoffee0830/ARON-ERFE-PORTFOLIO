"use client";

import {
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  Images,
  TextT,
  VideoCamera,
  Trash,
} from "@phosphor-icons/react";
import {
  coverShapeOf,
  coverShapes,
  disciplines,
  nearestShape,
  type Block,
  type CoverShape,
  type Discipline,
  type Project,
} from "@/content/projects";
import { slugify } from "@/lib/admin/validate";
import { GalleryField } from "./GalleryField";
import { useConfirm } from "./Confirm";
import { ImageField } from "./ImageField";
import { VideoField } from "./VideoField";
import { Button, IconButton, Select, TextArea, TextInput, Toggle } from "./ui";

const blockNames: Record<Block["type"], string> = {
  text: "Text",
  image: "Image",
  pair: "Two images",
  gallery: "Images",
  video: "Video",
};

export function ProjectForm({
  project: p,
  onChange,
  onDelete,
  savedSlugs,
}: {
  project: Project;
  onChange: (p: Project) => void;
  onDelete: () => void;
  /** Slugs that exist on the live site, for the "View page" link. */
  savedSlugs: string[];
}) {
  const set = <K extends keyof Project>(k: K, v: Project[K]) => onChange({ ...p, [k]: v });
  const confirm = useConfirm();

  function setTitle(title: string) {
    // Keep the address in step with the title until it has been edited by hand.
    const follow = p.slug === "" || p.slug === slugify(p.title);
    onChange({ ...p, title, slug: follow ? slugify(title) : p.slug });
  }

  const setBlock = (i: number, b: Block) => set("blocks", p.blocks.map((x, j) => (j === i ? b : x)));
  const moveBlock = (i: number, d: -1 | 1) => {
    const next = [...p.blocks];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    set("blocks", next);
  };
  const addBlock = (type: Block["type"]) => {
    const empty = { src: "", alt: "" };
    const b: Block =
      type === "text"
        ? { type, heading: "", body: "" }
        : type === "gallery"
          ? { type, images: [] }
          : type === "video"
            ? { type, url: "" }
          : type === "image"
            ? { type, size: "full", image: { ...empty } }
            : { type, images: [{ ...empty }, { ...empty }] };
    set("blocks", [...p.blocks, b]);
  };

  const folder = p.slug || "untitled";
  const shape = coverShapeOf(p);
  const live = savedSlugs.includes(p.slug) && !p.draft;

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">{p.title || "Untitled project"}</h1>
          <p className="mt-1 text-sm text-muted">
            {disciplines[p.discipline].label}
            {p.draft ? ", hidden from the live site" : ", visible on the live site"}
          </p>
        </div>
        {live && (
          <a
            href={`/work/${p.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 border border-line px-4 text-sm font-medium transition-colors hover:border-fg"
          >
            View page
            <ArrowSquareOut size={16} />
          </a>
        )}
      </header>

      <Section title="Basics">
        <Toggle
          label="Show on the live site"
          hint="Leave off while you work on it. Hidden projects still show when you preview on your computer."
          checked={!p.draft}
          onChange={(v) => set("draft", !v)}
        />
        <TextInput label="Title" value={p.title} onChange={setTitle} placeholder="e.g. Harrow Ceramics" />
        <TextInput
          label="Page address"
          hint={`The project's link: yoursite.com/work/${p.slug || "…"}. Lowercase letters, numbers and dashes.`}
          value={p.slug}
          onChange={(v) => set("slug", slugify(v))}
          spellCheck={false}
        />
        <div className="grid gap-6 sm:grid-cols-[1fr_140px]">
          <Select<Discipline>
            label="Discipline"
            value={p.discipline}
            options={(Object.keys(disciplines) as Discipline[]).map((d) => ({
              value: d,
              label: disciplines[d].label,
            }))}
            onChange={(v) => set("discipline", v)}
          />
          <TextInput
            label="Year"
            type="number"
            inputMode="numeric"
            value={String(p.year)}
            onChange={(v) => set("year", Number(v) || 0)}
          />
        </div>
        <TextInput label="Your role" value={p.role} onChange={(v) => set("role", v)} placeholder="e.g. Identity design" />
        <TextArea
          label="Deliverables"
          hint="One per line."
          rows={3}
          value={p.deliverables.join("\n")}
          onChange={(v) => set("deliverables", v.split("\n"))}
        />
        <TextArea
          label="Summary"
          hint="One or two sentences. Shown at the top of the project page."
          rows={3}
          value={p.summary}
          onChange={(v) => set("summary", v)}
        />
      </Section>

      <Section title="Cover" hint="Shown in the work grid, on the home page and at the top of the project page.">
        <ShapePicker value={shape} onChange={(s) => set("coverShape", s)} />
        <ImageField
          label="Cover image"
          value={p.cover}
          onChange={(cover, up) =>
            // A new upload picks the closest shape; you can still change it above.
            onChange({ ...p, cover, ...(up ? { coverShape: nearestShape(up.width, up.height) } : {}) })
          }
          folder={folder}
          fixedRatio={coverShapes[shape].ratio}
          fixedRatioNote="Uploading picks the closest shape automatically. If the image doesn't match the shape exactly, the edges are cropped."
        />
      </Section>

      <Section title="Page content" hint="The project page, top to bottom, below the cover.">
        {p.blocks.length === 0 && (
          <p className="border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            No content yet. Add text and images below.
          </p>
        )}
        <ol className="flex flex-col gap-4">
          {p.blocks.map((b, i) => (
            <li key={i} className="border border-line bg-bg">
              <div className="flex items-center justify-between border-b border-line py-1 pl-4 pr-1">
                <span className="text-sm font-medium">
                  {i + 1}. {blockNames[b.type]}
                </span>
                <div className="flex">
                  <IconButton label="Move up" disabled={i === 0} onClick={() => moveBlock(i, -1)}>
                    <ArrowUp size={16} />
                  </IconButton>
                  <IconButton label="Move down" disabled={i === p.blocks.length - 1} onClick={() => moveBlock(i, 1)}>
                    <ArrowDown size={16} />
                  </IconButton>
                  <IconButton
                    label="Delete block"
                    className="hover:text-accent"
                    onClick={() => set("blocks", p.blocks.filter((_, j) => j !== i))}
                  >
                    <Trash size={16} />
                  </IconButton>
                </div>
              </div>
              <div className="flex flex-col gap-6 p-4 md:p-5">
                <BlockFields block={b} folder={folder} onChange={(nb) => setBlock(i, nb)} />
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => addBlock("text")}>
            <TextT size={16} /> Add text
          </Button>
          <Button onClick={() => addBlock("gallery")}>
            <Images size={16} /> Add images
          </Button>
          <Button onClick={() => addBlock("video")}>
            <VideoCamera size={16} /> Add video
          </Button>
        </div>
      </Section>

      <div className="border-t border-line pt-8">
        <Button
          variant="danger"
          onClick={async () => {
            const ok = await confirm({
              title: `Delete "${p.title || "this project"}"?`,
              message: "It is removed from your site the next time you save.",
              confirmLabel: "Delete project",
              destructive: true,
            });
            if (ok) onDelete();
          }}
        >
          <Trash size={16} /> Delete project
        </Button>
      </div>
    </div>
  );
}

function BlockFields({
  block: b,
  folder,
  onChange,
}: {
  block: Block;
  folder: string;
  onChange: (b: Block) => void;
}) {
  if (b.type === "text")
    return (
      <>
        <TextInput
          label="Heading"
          hint="A short label, e.g. Brief, Approach, Outcome."
          value={b.heading}
          onChange={(heading) => onChange({ ...b, heading })}
        />
        <TextArea label="Text" rows={5} value={b.body} onChange={(body) => onChange({ ...b, body })} />
      </>
    );
  if (b.type === "video") return <VideoField block={b} onChange={onChange} />;
  if (b.type === "gallery")
    return <GalleryField value={b.images} folder={folder} onChange={(images) => onChange({ ...b, images })} />;
  if (b.type === "image")
    return (
      <>
        <ImageField label="Image" value={b.image} folder={folder} onChange={(image) => onChange({ ...b, image })} />
        <Select<"full" | "inset">
          label="Width"
          value={b.size ?? "full"}
          options={[
            { value: "full", label: "Full width" },
            { value: "inset", label: "Narrower, centred" },
          ]}
          onChange={(size) => onChange({ ...b, size })}
        />
      </>
    );
  return (
    <>
      {b.images.map((img, k) => (
        <ImageField
          key={k}
          label={k === 0 ? "Left image" : "Right image (sits a little lower)"}
          value={img}
          folder={folder}
          onChange={(v) => {
            const images = [...b.images] as [typeof img, typeof img];
            images[k] = v;
            onChange({ ...b, images });
          }}
        />
      ))}
    </>
  );
}

function ShapePicker({ value, onChange }: { value: CoverShape; onChange: (s: CoverShape) => void }) {
  return (
    <div role="radiogroup" aria-label="Cover shape" className="grid grid-cols-3 gap-2">
      {(Object.keys(coverShapes) as CoverShape[]).map((s) => {
        const on = value === s;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(s)}
            className={`flex flex-col items-center gap-3 border px-2 pb-3 pt-4 text-center transition-colors ${
              on ? "border-fg bg-bg-sunk" : "border-line hover:border-muted"
            }`}
          >
            <span className="flex h-10 items-center">
              <span
                aria-hidden
                className={`block h-9 border-2 ${on ? "border-fg" : "border-muted"}`}
                style={{ aspectRatio: coverShapes[s].ratio }}
              />
            </span>
            <span>
              <span className="block text-sm font-medium">{coverShapes[s].label}</span>
              <span className="block font-mono text-[11px] text-muted">{coverShapes[s].example}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
