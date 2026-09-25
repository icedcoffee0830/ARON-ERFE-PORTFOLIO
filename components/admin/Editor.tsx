"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowSquareOut,
  ArrowUp,
  CheckCircle,
  EyeSlash,
  Plus,
  SignOut,
  WarningCircle,
} from "@phosphor-icons/react";
import { disciplines, type Project } from "@/content/projects";
import type { Site } from "@/content/site";
import { prepareImage } from "@/lib/admin/image";
import { validate } from "@/lib/admin/validate";
import { EditorContext, type EditorApi } from "./context";
import { ProjectForm } from "./ProjectForm";
import { SiteForm } from "./SiteForm";
import { Button, IconButton } from "./ui";

type Mode = "github" | "local";
type UploadRef = { path: string; sha?: string };
type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; message: string; href?: string }
  | { kind: "error"; messages: string[] };

/** Trims the things forms leave behind (blank deliverable lines, stray spaces). */
function tidy(projects: Project[]): Project[] {
  return projects.map((p) => ({
    ...p,
    title: p.title.trim(),
    deliverables: p.deliverables.map((d) => d.trim()).filter(Boolean),
  }));
}

export function Editor({
  initial,
  mode,
  focus,
}: {
  initial: { site: Site; projects: Project[] };
  mode: Mode;
  focus?: string;
}) {
  const [site, setSite] = useState(initial.site);
  const [projects, setProjects] = useState(initial.projects);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [selected, setSelected] = useState<number | "site">(() => {
    const i = initial.projects.findIndex((p) => p.slug === focus);
    return i >= 0 ? i : "site";
  });
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const uploads = useRef<UploadRef[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const main = useRef<HTMLDivElement>(null);

  const dirty = JSON.stringify({ site, projects }) !== saved;
  const savedSlugs = useMemo(
    () => (JSON.parse(saved) as { projects: Project[] }).projects.map((p) => p.slug),
    [saved],
  );

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const api: EditorApi = useMemo(
    () => ({
      async upload(file, folder) {
        const prepared = await prepareImage(file);
        const form = new FormData();
        form.append("file", prepared.file);
        form.append("folder", folder);
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "Upload failed.");
        uploads.current.push(data as UploadRef);
        const url = URL.createObjectURL(prepared.file);
        setPreviews((p) => ({ ...p, [data.path]: url }));
        return { path: data.path, width: prepared.width, height: prepared.height };
      },
      resolve: (src) => previews[src] ?? src,
    }),
    [previews],
  );

  const select = useCallback((next: number | "site") => {
    setSelected(next);
    main.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, []);

  function addProject() {
    const year = new Date().getFullYear();
    const p: Project = {
      slug: "",
      title: "",
      discipline: "brand",
      year,
      role: "",
      deliverables: [],
      summary: "",
      cover: { src: "", alt: "" },
      blocks: [
        { type: "text", heading: "Brief", body: "" },
        { type: "image", size: "full", image: { src: "", alt: "" } },
      ],
      draft: true,
    };
    setProjects((ps) => [...ps, p]);
    select(projects.length);
  }

  function move(i: number, d: -1 | 1) {
    setProjects((ps) => {
      const next = [...ps];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });
    if (selected === i) setSelected(i + d);
    else if (selected === i + d) setSelected(i);
  }

  async function save() {
    const clean = tidy(projects);
    const problems = validate(site, clean);
    if (problems.length) {
      setStatus({ kind: "error", messages: problems });
      return;
    }
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site, projects: clean, uploads: uploads.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Saving failed.");
      setProjects(clean);
      setSaved(JSON.stringify({ site, projects: clean }));
      uploads.current = [];
      setStatus(
        data.mode === "github"
          ? {
              kind: "saved",
              message: "Saved. Your live site updates in about a minute.",
              href: data.commitUrl,
            }
          : { kind: "saved", message: "Saved to your project files. Push to GitHub to publish." },
      );
    } catch (e) {
      setStatus({ kind: "error", messages: [(e as Error).message] });
    }
  }

  async function signOut() {
    if (dirty && !confirm("You have unsaved changes. Sign out anyway?")) return;
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  }

  const current = typeof selected === "number" ? projects[selected] : null;

  return (
    <EditorContext.Provider value={api}>
      <div className="min-h-[100dvh]">
        <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
            <div className="flex min-w-0 items-baseline gap-3">
              <span className="text-lg font-semibold tracking-tight">Editor</span>
              <span className="hidden truncate text-[13px] text-muted sm:inline">
                {mode === "github" ? "Saves to GitHub and updates the live site" : "Saves to the files on this computer"}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span aria-live="polite" className="hidden text-[13px] text-muted md:inline">
                {status.kind === "saving" ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}
              </span>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden h-10 items-center gap-2 px-3 text-sm font-medium text-muted transition-colors hover:text-fg sm:inline-flex"
              >
                View site <ArrowSquareOut size={16} />
              </a>
              <Button variant="primary" onClick={save} disabled={!dirty || status.kind === "saving"}>
                {status.kind === "saving" ? "Saving…" : "Save changes"}
              </Button>
              <IconButton label="Sign out" onClick={signOut} className="size-10">
                <SignOut size={18} />
              </IconButton>
            </div>
          </div>

          {(status.kind === "saved" || status.kind === "error") && (
            <div
              role={status.kind === "error" ? "alert" : "status"}
              className={`flex items-start gap-3 border-t px-4 py-3 text-sm md:px-6 ${
                status.kind === "error" ? "border-accent/40 text-accent" : "border-line"
              }`}
            >
              {status.kind === "error" ? (
                <WarningCircle size={18} className="mt-px shrink-0" />
              ) : (
                <CheckCircle size={18} weight="fill" className="mt-px shrink-0 text-fg" />
              )}
              <div className="min-w-0 flex-1">
                {status.kind === "error" ? (
                  <>
                    <p className="font-medium">Not saved. Fix these first:</p>
                    <ul className="mt-1 list-disc pl-5">
                      {status.messages.slice(0, 6).map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>
                    {status.message}{" "}
                    {status.href && (
                      <a href={status.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                        See the change on GitHub
                      </a>
                    )}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStatus({ kind: "idle" })}
                className="text-[13px] text-muted underline-offset-4 hover:text-fg hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </header>

        <div className="grid lg:grid-cols-[300px_1fr]">
          <nav
            aria-label="Content"
            className="border-b border-line lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r"
          >
            <div className="p-3">
              <SideItem active={selected === "site"} onClick={() => select("site")}>
                <span className="font-medium">Site details</span>
                <span className="text-[13px] text-muted">Name, intro, contact</span>
              </SideItem>
            </div>
            <div className="flex items-center justify-between border-t border-line px-4 pb-2 pt-4">
              <h2 className="text-sm font-medium">
                Projects <span className="font-mono text-xs text-muted">{projects.length}</span>
              </h2>
              <Button variant="ghost" className="h-8 px-2" onClick={addProject}>
                <Plus size={16} weight="bold" /> New
              </Button>
            </div>
            <ol className="flex flex-col px-3 pb-4">
              {projects.map((p, i) => (
                <li key={i} className="group flex items-center">
                  <SideItem active={selected === i} onClick={() => select(i)}>
                    <span className="flex items-center gap-2 truncate font-medium">
                      <span className="truncate">{p.title || "Untitled project"}</span>
                      {p.draft && <EyeSlash aria-label="Hidden" size={14} className="shrink-0 text-muted" />}
                    </span>
                    <span className="text-[13px] text-muted">{disciplines[p.discipline].label}</span>
                  </SideItem>
                  <div className="flex flex-col opacity-100 lg:opacity-0 lg:transition-opacity lg:group-focus-within:opacity-100 lg:group-hover:opacity-100">
                    <IconButton label={`Move ${p.title || "project"} up`} className="size-7" disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp size={14} />
                    </IconButton>
                    <IconButton
                      label={`Move ${p.title || "project"} down`}
                      className="size-7"
                      disabled={i === projects.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowDown size={14} />
                    </IconButton>
                  </div>
                </li>
              ))}
            </ol>
            {projects.length > 0 && (
              <p className="px-4 pb-6 text-[13px] leading-snug text-muted">
                The order here is the order on your site. The first project of each discipline is its cover on the home page.
              </p>
            )}
          </nav>

          <div ref={main} className="min-w-0">
            <div className="mx-auto max-w-[760px] px-4 py-10 md:px-8 md:py-14">
              {current ? (
                <ProjectForm
                  key={selected}
                  project={current}
                  savedSlugs={savedSlugs}
                  onChange={(np) => setProjects((ps) => ps.map((x, j) => (j === selected ? np : x)))}
                  onDelete={() => {
                    setProjects((ps) => ps.filter((_, j) => j !== selected));
                    select("site");
                  }}
                />
              ) : (
                <SiteForm site={site} onChange={setSite} />
              )}
            </div>
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  );
}

function SideItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={`flex min-w-0 flex-1 flex-col items-start gap-0.5 border-l-2 px-3 py-2.5 text-left text-sm transition-colors ${
        active ? "border-accent bg-bg-sunk" : "border-transparent hover:bg-bg-sunk"
      }`}
    >
      {children}
    </button>
  );
}
