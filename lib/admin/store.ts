import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Project } from "@/content/projects";
import type { Site } from "@/content/site";

/*
  Where the editor reads and writes content.

  - GitHub mode (GITHUB_TOKEN set): reads the latest files from the repo and saves
    each "Save changes" as one commit. Vercel redeploys the site from that commit.
  - Local mode (`npm run dev` without a token): reads and writes the project files
    directly. Push to GitHub yourself to publish.
*/

export type Content = { site: Site; projects: Project[] };
export type UploadRef = { path: string; sha?: string };
export type SaveResult = { mode: "github" | "local"; commitUrl?: string };

const SITE_FILE = "content/site.json";
const PROJECTS_FILE = "content/projects.json";

export function storeMode(): "github" | "local" | "unavailable" {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) return "github";
  if (process.env.NODE_ENV !== "production") return "local";
  return "unavailable";
}

/** Public paths the editor may write images to: /portrait-*, /logo-*, /logo-dark-* and /work/<slug>/<file>. */
export function isAllowedImagePath(p: string) {
  return (
    /^\/work\/[a-z0-9-]{1,80}\/[a-z0-9-]{1,120}\.(webp|jpg|jpeg|png|gif)$/.test(p) ||
    /^\/portrait-[a-z0-9-]{1,40}\.(webp|jpg|jpeg|png)$/.test(p) ||
    /^\/logo(-dark)?-[a-z0-9]{1,40}\.(svg|webp|png|jpg|jpeg)$/.test(p)
  );
}

const json = (data: unknown) => JSON.stringify(data, null, 2) + "\n";

/* ---------------- Local ---------------- */

const root = process.cwd();

const local = {
  async read(): Promise<Content> {
    const [site, projects] = await Promise.all([
      fs.readFile(path.join(root, SITE_FILE), "utf8"),
      fs.readFile(path.join(root, PROJECTS_FILE), "utf8"),
    ]);
    return { site: JSON.parse(site), projects: JSON.parse(projects) };
  },
  async upload(publicPath: string, bytes: Buffer): Promise<UploadRef> {
    const file = path.join(root, "public", publicPath);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, bytes);
    return { path: publicPath };
  },
  // Images were already written to /public on upload.
  async save(content: Content, _uploads?: UploadRef[]): Promise<SaveResult> {
    await fs.writeFile(path.join(root, SITE_FILE), json(content.site));
    await fs.writeFile(path.join(root, PROJECTS_FILE), json(content.projects));
    return { mode: "local" };
  },
};

/* ---------------- GitHub ---------------- */

const repo = () => process.env.GITHUB_REPO!;
const branch = () => process.env.GITHUB_BRANCH || "main";

async function gh<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.github.com/repos/${repo()}${endpoint}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new GitHubError(res.status, detail.slice(0, 300));
  }
  return res.json() as Promise<T>;
}

export class GitHubError extends Error {
  constructor(
    public status: number,
    detail: string,
  ) {
    super(
      status === 401
        ? "GitHub rejected the token. Check GITHUB_TOKEN in your Vercel settings."
        : status === 403 || status === 404
          ? "GitHub denied access. Check that the token can read and write Contents on GITHUB_REPO."
          : `GitHub error ${status}. ${detail}`,
    );
  }
}

async function readRepoFile(file: string) {
  const res = await gh<{ content: string }>(
    `/contents/${file}?ref=${encodeURIComponent(branch())}`,
  );
  return JSON.parse(Buffer.from(res.content, "base64").toString("utf8"));
}

const github = {
  async read(): Promise<Content> {
    const [site, projects] = await Promise.all([
      readRepoFile(SITE_FILE),
      readRepoFile(PROJECTS_FILE),
    ]);
    return { site, projects };
  },
  // Stores the image as a git blob now; it joins the repo in the next commit.
  async upload(publicPath: string, bytes: Buffer): Promise<UploadRef> {
    const blob = await gh<{ sha: string }>("/git/blobs", {
      method: "POST",
      body: JSON.stringify({ content: bytes.toString("base64"), encoding: "base64" }),
    });
    return { path: publicPath, sha: blob.sha };
  },
  async save(content: Content, uploads: UploadRef[]): Promise<SaveResult> {
    // Retry once if someone else pushed between reading the branch and moving it.
    for (let attempt = 0; ; attempt++) {
      try {
        const ref = await gh<{ object: { sha: string } }>(`/git/ref/heads/${branch()}`);
        const parent = ref.object.sha;
        const commit = await gh<{ tree: { sha: string } }>(`/git/commits/${parent}`);
        const tree = await gh<{ sha: string }>("/git/trees", {
          method: "POST",
          body: JSON.stringify({
            base_tree: commit.tree.sha,
            tree: [
              { path: SITE_FILE, mode: "100644", type: "blob", content: json(content.site) },
              { path: PROJECTS_FILE, mode: "100644", type: "blob", content: json(content.projects) },
              ...uploads
                .filter((u) => u.sha && isAllowedImagePath(u.path))
                .map((u) => ({ path: `public${u.path}`, mode: "100644", type: "blob", sha: u.sha })),
            ],
          }),
        });
        const next = await gh<{ sha: string; html_url: string }>("/git/commits", {
          method: "POST",
          body: JSON.stringify({
            message: "Update content from editor",
            tree: tree.sha,
            parents: [parent],
          }),
        });
        await gh(`/git/refs/heads/${branch()}`, {
          method: "PATCH",
          body: JSON.stringify({ sha: next.sha }),
        });
        return { mode: "github", commitUrl: next.html_url };
      } catch (e) {
        if (attempt === 0 && e instanceof GitHubError && e.status === 422) continue;
        throw e;
      }
    }
  },
};

export function getStore() {
  const mode = storeMode();
  if (mode === "github") return github;
  if (mode === "local") return local;
  throw new Error(
    "Saving is not set up. Add GITHUB_TOKEN and GITHUB_REPO in your Vercel project settings.",
  );
}
