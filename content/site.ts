import data from "./site.json";

/**
 * Site-wide settings. Edit them at /admin, or directly in site.json.
 */
export type Site = {
  name: string;
  role: string;
  /** Header logo in /public, e.g. "/logo-abc.svg". null shows the name as text. */
  logo: string | null;
  /** Optional light version of the logo for dark mode. Falls back to `logo`. */
  logoDark: string | null;
  /** Show the name as text next to the logo. */
  showNameWithLogo: boolean;
  /** Sentence under the hero headline. */
  intro: string;
  /** Large paragraph in the About section. */
  statement: string;
  /** Path to a portrait in /public, e.g. "/portrait.webp". null hides it. */
  portrait: string | null;
  /** Soft skills, shown as tags in the About section. */
  skills: string[];
  /** Experience entries, newest first. `detail` and `period` are optional. */
  experience: { title: string; detail?: string; period?: string }[];
  /** Software names, shown as lettered tiles. See lib/software.ts. */
  software: string[];
  email: string;
  /** Profile links shown under Contact. */
  links: { label: string; href: string }[];
};

export const site: Site = data;
