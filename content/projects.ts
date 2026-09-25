import data from "./projects.json";

export type Discipline = "brand" | "ui" | "print";

export const disciplines: Record<
  Discipline,
  { label: string; word: string; description: string; ratio: string }
> = {
  brand: {
    label: "Brand & identity",
    word: "Brand",
    description: "Logotypes, visual systems and the rules that keep them consistent.",
    ratio: "1 / 1",
  },
  ui: {
    label: "UI & product",
    word: "interface",
    description: "Interfaces for apps and websites, from first flow to final screen.",
    ratio: "16 / 10",
  },
  print: {
    label: "Graphic & print",
    word: "print",
    description: "Posters, publications and editorial layouts made for paper.",
    ratio: "4 / 5",
  },
};

export type Img = { src: string; alt: string; ratio?: string };

export type Block =
  | { type: "text"; heading: string; body: string }
  | { type: "image"; image: Img; size?: "full" | "inset" }
  | { type: "pair"; images: [Img, Img] };

export type Project = {
  slug: string;
  title: string;
  discipline: Discipline;
  year: number;
  role: string;
  deliverables: string[];
  summary: string;
  cover: Img;
  blocks: Block[];
  /** Hidden from the live site. Still visible in `npm run dev` so it can be previewed. */
  draft?: boolean;
};

/*
  Projects are edited at /admin, or directly in projects.json.
  Order in the file is the order on the site. Images live in /public/work/<slug>/.
*/
const all = data as Project[];

const showDrafts = process.env.NODE_ENV !== "production";

export function getProjects(): Project[] {
  return all.filter((p) => showDrafts || !p.draft);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}
