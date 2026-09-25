import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/ssr";
import {
  coverShapeOf,
  coverShapes,
  disciplines,
  getProject,
  getProjects,
  type Block,
  type Img,
} from "@/content/projects";
import { Reveal } from "@/components/Reveal";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

// How wide the cover sits on the project page, per shape. Tall shapes are
// narrower so the cover never fills more than a screen.
const coverWidth = {
  landscape: "",
  square: "md:ml-auto md:w-8/12",
  portrait: "md:ml-auto md:w-7/12",
} as const;

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const all = getProjects();
  const next = all[(all.findIndex((p) => p.slug === slug) + 1) % all.length];
  const shape = coverShapeOf(project);

  return (
    <article className="mx-auto max-w-[1400px] px-4 md:px-8">
      {project.draft && (
        <p
          role="note"
          className="mt-6 border border-accent px-4 py-3 text-sm text-accent"
        >
          Placeholder project. Replace it with real work in content/projects.ts.
        </p>
      )}

      <header className="pb-12 pt-10 md:pb-16 md:pt-14">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft aria-hidden size={16} weight="bold" />
          All work
        </Link>
        <h1 className="mt-10 text-[clamp(2.75rem,7vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
          {project.title}
        </h1>
        <div className="mt-10 grid grid-cols-1 gap-10 md:mt-14 md:grid-cols-12 md:gap-8">
          <p className="max-w-[40ch] text-xl leading-relaxed md:col-span-6 md:text-2xl md:leading-snug">
            {project.summary}
          </p>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm md:col-span-5 md:col-start-8">
            <Meta label="Discipline">{disciplines[project.discipline].label}</Meta>
            <Meta label="Year">
              <span className="font-mono">{project.year}</span>
            </Meta>
            <Meta label="Role">{project.role}</Meta>
            <Meta label="Deliverables">
              <ul>
                {project.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </Meta>
          </dl>
        </div>
      </header>

      <div className={coverWidth[shape]}>
        <Frame img={{ ...project.cover, ratio: coverShapes[shape].ratio }} priority sizes="(min-width: 768px) 90vw, 100vw" />
      </div>

      <div className="flex flex-col gap-20 py-20 md:gap-32 md:py-32">
        {project.blocks.map((b, i) => (
          <BlockView key={i} block={b} />
        ))}
      </div>

      {next && next.slug !== project.slug && (
        <nav aria-label="Next project" className="border-t border-line py-16 md:py-24">
          <Link href={`/work/${next.slug}`} className="group block">
            <span className="text-sm text-muted">Next project</span>
            <span className="mt-4 flex items-center gap-4 text-[clamp(2.25rem,5.5vw,5rem)] font-semibold leading-none tracking-[-0.045em] transition-colors duration-300 group-hover:text-accent">
              {next.title}
              <ArrowRight
                aria-hidden
                weight="bold"
                className="size-[0.6em] shrink-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-2"
              />
            </span>
          </Link>
        </nav>
      )}
    </article>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}

function Frame({ img, priority, sizes }: { img: Img; priority?: boolean; sizes: string }) {
  return (
    <div className="relative overflow-hidden bg-bg-sunk" style={{ aspectRatio: img.ratio ?? "16 / 10" }}>
      <Image src={img.src} alt={img.alt} fill priority={priority} sizes={sizes} className="object-cover" />
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return (
        <Reveal className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-8">
          <h2 className="font-medium md:col-span-3">{block.heading}</h2>
          <p className="max-w-[60ch] text-lg leading-relaxed text-muted md:col-span-7 md:col-start-5 md:text-xl">
            {block.body}
          </p>
        </Reveal>
      );
    case "image":
      return (
        <Reveal className={block.size === "inset" ? "md:mx-auto md:w-8/12" : ""}>
          <Frame img={block.image} sizes="(min-width: 768px) 90vw, 100vw" />
        </Reveal>
      );
    case "pair":
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {block.images.map((img, i) => (
            <Reveal key={img.src} delay={i * 0.08} className={i === 1 ? "md:mt-32" : ""}>
              <Frame img={img} sizes="(min-width: 768px) 45vw, 100vw" />
            </Reveal>
          ))}
        </div>
      );
  }
}
