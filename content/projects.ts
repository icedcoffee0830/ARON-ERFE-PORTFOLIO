import { site } from "./site";

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
  /** Sample content. Hidden from production builds, see site.showDraftsInProduction. */
  draft?: boolean;
};

/*
  To add real work: put images in /public/work/<slug>/ and add an entry below with
  src paths like "/work/<slug>/cover.jpg". Order here is the order on the site.
*/

const ph = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

function sample(
  slug: string,
  d: Discipline,
  brief: string,
  approach: string,
): Block[] {
  const [w, h] = d === "print" ? [1200, 1500] : d === "ui" ? [1600, 1000] : [1400, 1400];
  return [
    { type: "text", heading: "Brief", body: brief },
    {
      type: "image",
      size: "full",
      image: { src: ph(`${slug}-a`, 2000, 1250), alt: "Placeholder image", ratio: "16 / 10" },
    },
    {
      type: "pair",
      images: [
        { src: ph(`${slug}-b`, w, h), alt: "Placeholder image", ratio: disciplines[d].ratio },
        { src: ph(`${slug}-c`, w, h), alt: "Placeholder image", ratio: disciplines[d].ratio },
      ],
    },
    { type: "text", heading: "Approach", body: approach },
    {
      type: "image",
      size: "inset",
      image: { src: ph(`${slug}-d`, 1600, 1200), alt: "Placeholder image", ratio: "4 / 3" },
    },
  ];
}

const all: Project[] = [
  {
    slug: "harrow-ceramics",
    title: "Harrow Ceramics",
    discipline: "brand",
    year: 2025,
    role: "Identity design",
    deliverables: ["Logotype", "Colour system", "Packaging"],
    summary:
      "Sample project. An identity for a small ceramics studio, built around a stamped logotype.",
    cover: { src: ph("harrow-cover", 1400, 1400), alt: "Placeholder cover" },
    blocks: sample(
      "harrow",
      "brand",
      "Sample text. Describe who the client was, what they needed and what stood in the way.",
      "Sample text. Explain the key decisions, what you tried and why the final direction won.",
    ),
    draft: true,
  },
  {
    slug: "tempo",
    title: "Tempo",
    discipline: "ui",
    year: 2025,
    role: "Product design",
    deliverables: ["User flows", "Interface design", "Prototype"],
    summary: "Sample project. A training planner app for runners who follow a weekly plan.",
    cover: { src: ph("tempo-cover", 1600, 1000), alt: "Placeholder cover" },
    blocks: sample(
      "tempo",
      "ui",
      "Sample text. Describe the product, its users and the problem the interface had to solve.",
      "Sample text. Walk through the flows, the constraints and what changed after testing.",
    ),
    draft: true,
  },
  {
    slug: "night-assembly",
    title: "Night Assembly",
    discipline: "print",
    year: 2024,
    role: "Poster design",
    deliverables: ["Poster series", "Typography"],
    summary: "Sample project. A series of posters for a run of late-night concerts.",
    cover: { src: ph("assembly-cover", 1200, 1500), alt: "Placeholder cover" },
    blocks: sample(
      "assembly",
      "print",
      "Sample text. Describe the event, the audience and where the posters were seen.",
      "Sample text. Explain the typographic idea and how it carried across the series.",
    ),
    draft: true,
  },
  {
    slug: "verso-books",
    title: "Verso Books",
    discipline: "brand",
    year: 2024,
    role: "Identity design",
    deliverables: ["Wordmark", "Signage", "Stationery"],
    summary: "Sample project. A wordmark and signage system for an independent bookshop.",
    cover: { src: ph("verso-cover", 1400, 1400), alt: "Placeholder cover" },
    blocks: sample(
      "verso",
      "brand",
      "Sample text. Describe the shop, its neighbourhood and what the old identity lacked.",
      "Sample text. Explain how the wordmark was drawn and how it moves onto signage.",
    ),
    draft: true,
  },
  {
    slug: "waypoint",
    title: "Waypoint",
    discipline: "ui",
    year: 2024,
    role: "UI design",
    deliverables: ["Web app", "Design system"],
    summary: "Sample project. A parcel tracking web app and the component library behind it.",
    cover: { src: ph("waypoint-cover", 1600, 1000), alt: "Placeholder cover" },
    blocks: sample(
      "waypoint",
      "ui",
      "Sample text. Describe who tracks parcels, how often, and what they needed to see first.",
      "Sample text. Explain the component decisions and how the system scaled across screens.",
    ),
    draft: true,
  },
  {
    slug: "specimen-vol-1",
    title: "Specimen, Vol. 1",
    discipline: "print",
    year: 2023,
    role: "Editorial design",
    deliverables: ["Booklet", "Layout", "Print production"],
    summary: "Sample project. A printed type specimen booklet, designed and produced by hand.",
    cover: { src: ph("specimen-cover", 1200, 1500), alt: "Placeholder cover" },
    blocks: sample(
      "specimen",
      "print",
      "Sample text. Describe what the booklet showcases and who it was made for.",
      "Sample text. Explain the grid, the paper choice and the production process.",
    ),
    draft: true,
  },
];

const showDrafts =
  process.env.NODE_ENV !== "production" || site.showDraftsInProduction;

export function getProjects(): Project[] {
  return all.filter((p) => showDrafts || !p.draft);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}
