import data from "./site.json";

/**
 * Site-wide settings. Edit them at /admin, or directly in site.json.
 */
export type Site = {
  name: string;
  role: string;
  /** Sentence under the hero headline. */
  intro: string;
  /** Large paragraph in the About section. */
  statement: string;
  /** Path to a portrait in /public, e.g. "/portrait.webp". null hides it. */
  portrait: string | null;
  email: string;
  /** Profile links shown under Contact. */
  links: { label: string; href: string }[];
};

export const site: Site = data;
