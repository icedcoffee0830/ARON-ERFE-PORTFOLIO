import data from "./projects.json";

export type Discipline = "brand" | "ui" | "print";

export type CoverShape = "square" | "landscape" | "portrait";

export const coverShapes: Record<CoverShape, { label: string; ratio: string; example: string }> = {
  square: { label: "Square", ratio: "1 / 1", example: "1080 × 1080" },
  landscape: { label: "Landscape", ratio: "16 / 9", example: "1920 × 1080" },
  portrait: { label: "Portrait", ratio: "4 / 5", example: "1080 × 1350" },
};

export const disciplines: Record<
  Discipline,
  { label: string; description: string; shape: CoverShape }
> = {
  brand: {
    label: "Brand & identity",
    description: "Logotypes, visual systems and the rules that keep them consistent.",
    shape: "square",
  },
  ui: {
    label: "UI & product",
    description: "Interfaces for apps and websites, from first flow to final screen.",
    shape: "landscape",
  },
  print: {
    label: "Graphic & print",
    description: "Posters, publications and editorial layouts made for paper.",
    shape: "portrait",
  },
};

/** The cover's shape: chosen per project, otherwise the discipline's usual shape. */
export function coverShapeOf(p: Pick<Project, "discipline" | "coverShape">): CoverShape {
  return p.coverShape ?? disciplines[p.discipline].shape;
}

/** Closest cover shape for an image's proportions. */
export function nearestShape(width: number, height: number): CoverShape {
  const r = width / height;
  return (Object.keys(coverShapes) as CoverShape[]).reduce((best, s) => {
    const [w, h] = coverShapes[s].ratio.split(" / ").map(Number);
    const [bw, bh] = coverShapes[best].ratio.split(" / ").map(Number);
    return Math.abs(Math.log(r / (w / h))) < Math.abs(Math.log(r / (bw / bh))) ? s : best;
  });
}

export type Img = { src: string; alt: string; ratio?: string };

export type Block =
  | { type: "text"; heading: string; body: string }
  | { type: "image"; image: Img; size?: "full" | "inset" }
  | { type: "pair"; images: [Img, Img] }
  /** Any number of images, laid out automatically by their proportions. */
  | { type: "gallery"; images: Img[] }
  /** A YouTube, Google Drive or Vimeo link. `ratio` is a VideoShape, e.g. "16 / 9". */
  | { type: "video"; url: string; ratio?: string; caption?: string };

export const GALLERY_MAX = 60;

export type Project = {
  slug: string;
  title: string;
  discipline: Discipline;
  year: number;
  role: string;
  deliverables: string[];
  summary: string;
  cover: Img;
  /** Shape of the cover everywhere it appears. Defaults to the discipline's usual shape. */
  coverShape?: CoverShape;
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
