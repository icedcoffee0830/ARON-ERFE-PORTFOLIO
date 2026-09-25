import { site } from "@/content/site";
import { coverShapeOf, coverShapes, disciplines, getProjects, type Discipline } from "@/content/projects";
import { Hero, type HeroCover } from "@/components/Hero";
import { DotField } from "@/components/DotField";
import { WorkIndex } from "@/components/WorkIndex";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";

const keys = Object.keys(disciplines) as Discipline[];
const pick = <T,>(f: (d: Discipline) => T) =>
  Object.fromEntries(keys.map((d) => [d, f(d)])) as Record<Discipline, T>;

export default function Home() {
  const projects = getProjects();

  // One cover per discipline: the first project listed in each.
  const covers: HeroCover[] = keys.flatMap((d) => {
    const p = projects.find((x) => x.discipline === d);
    return p
      ? [{ discipline: d, slug: p.slug, title: p.title, src: p.cover.src, alt: p.cover.alt, ratio: coverShapes[coverShapeOf(p)].ratio }]
      : [];
  });

  return (
    <>
      {/* The dot field sits behind the hero and fades out at the edges and towards the work. */}
      <div className="relative isolate">
        <DotField className="absolute inset-0 -z-10 size-full [mask-image:radial-gradient(ellipse_90%_80%_at_50%_40%,black_45%,transparent_100%)]" />
        <Hero intro={site.intro} words={pick((d) => disciplines[d].word)} covers={covers} />
      </div>
      <WorkIndex
        items={projects.map((p) => ({
          slug: p.slug,
          title: p.title,
          discipline: p.discipline,
          year: p.year,
          cover: p.cover,
          ratio: coverShapes[coverShapeOf(p)].ratio,
        }))}
        labels={pick((d) => disciplines[d].label)}
      />
      <About />
      <Contact email={site.email} links={site.links} />
    </>
  );
}
