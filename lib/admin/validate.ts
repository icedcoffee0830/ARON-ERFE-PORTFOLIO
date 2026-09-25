import type { Block, Img, Project } from "@/content/projects";
import type { Site } from "@/content/site";

/*
  Checks content before it is saved. Runs in the editor (to show messages next to
  the Save button) and again on the server (so a bad request can never be committed).
*/

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DISCIPLINES = ["brand", "ui", "print"];

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const str = (v: unknown, max = 5000) => typeof v === "string" && v.length <= max;
const src = (v: unknown) =>
  typeof v === "string" && (v === "" || /^\/[\w\-./]+$/.test(v) || /^https:\/\//.test(v));

function img(i: Img | undefined, where: string, out: string[]) {
  if (!i || !src(i.src) || !str(i.alt, 300)) out.push(`${where}: invalid image.`);
  else if (!i.src) out.push(`${where}: add an image.`);
}

export function validate(site: Site, projects: Project[]): string[] {
  const out: string[] = [];

  if (!site || typeof site !== "object") return ["Site details are missing."];
  if (!str(site.name, 80) || !site.name.trim()) out.push("Site details: name is required.");
  if (!str(site.role, 80)) out.push("Site details: role is too long.");
  if (!str(site.intro, 300)) out.push("Site details: intro is too long.");
  if (!str(site.statement, 1500)) out.push("Site details: statement is too long.");
  if (!str(site.email, 200) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email))
    out.push("Site details: enter a valid email address.");
  if (site.portrait != null && !src(site.portrait)) out.push("Site details: invalid portrait.");
  if (site.logo != null && !src(site.logo)) out.push("Site details: invalid logo.");
  if (site.logoDark != null && !src(site.logoDark)) out.push("Site details: invalid dark mode logo.");
  if (!Array.isArray(site.links)) out.push("Site details: invalid links.");
  else
    site.links.forEach((l, i) => {
      if (!str(l?.label, 60) || !l.label.trim()) out.push(`Link ${i + 1}: add a label.`);
      if (!str(l?.href, 500) || !/^(https?:\/\/|mailto:)/.test(l.href))
        out.push(`Link ${i + 1}: the address must start with https://`);
    });

  if (!Array.isArray(projects)) return [...out, "Projects are missing."];
  const seen = new Set<string>();
  projects.forEach((p, i) => {
    const name = p?.title?.trim() || `Project ${i + 1}`;
    if (!str(p.title, 120) || !p.title.trim()) out.push(`${name}: title is required.`);
    if (!SLUG_RE.test(p.slug ?? "")) out.push(`${name}: the page address can only use a-z, 0-9 and dashes.`);
    else if (seen.has(p.slug)) out.push(`${name}: another project already uses the address "${p.slug}".`);
    seen.add(p.slug);
    if (!DISCIPLINES.includes(p.discipline)) out.push(`${name}: choose a discipline.`);
    if (!Number.isInteger(p.year) || p.year < 1900 || p.year > 2100) out.push(`${name}: enter a valid year.`);
    if (!str(p.role, 120)) out.push(`${name}: role is too long.`);
    if (!str(p.summary, 600)) out.push(`${name}: summary is too long.`);
    if (!Array.isArray(p.deliverables) || !p.deliverables.every((d) => str(d, 80)))
      out.push(`${name}: invalid deliverables.`);
    img(p.cover, `${name}, cover`, out);
    if (p.coverShape != null && !["square", "landscape", "portrait"].includes(p.coverShape))
      out.push(`${name}: choose a cover shape.`);
    if (!Array.isArray(p.blocks)) out.push(`${name}: invalid content blocks.`);
    else p.blocks.forEach((b: Block, j) => blockCheck(b, `${name}, block ${j + 1}`, out));
  });
  return out;
}

function blockCheck(b: Block, where: string, out: string[]) {
  if (b?.type === "text") {
    if (!str(b.heading, 120) || !str(b.body, 8000)) out.push(`${where}: text is too long.`);
  } else if (b?.type === "image") {
    img(b.image, where, out);
  } else if (b?.type === "pair") {
    if (!Array.isArray(b.images) || b.images.length !== 2) out.push(`${where}: needs two images.`);
    else b.images.forEach((i, k) => img(i, `${where}, image ${k + 1}`, out));
  } else if (b?.type === "gallery") {
    if (!Array.isArray(b.images) || b.images.length === 0)
      out.push(`${where}: add at least one image, or delete the block.`);
    else if (b.images.length > 60) out.push(`${where}: a gallery holds up to 60 images.`);
    else b.images.forEach((i, k) => img(i, `${where}, image ${k + 1}`, out));
  } else out.push(`${where}: unknown block type.`);
}
