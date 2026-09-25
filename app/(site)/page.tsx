import { site } from "@/content/site";
import { coverShapeOf, coverShapes, disciplines, getProjects, type Discipline } from "@/content/projects";
import { Hero } from "@/components/Hero";
import { DotField } from "@/components/DotField";
import { WorkIndex } from "@/components/WorkIndex";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";

const keys = Object.keys(disciplines) as Discipline[];
const pick = <T,>(f: (d: Discipline) => T) =>
  Object.fromEntries(keys.map((d) => [d, f(d)])) as Record<Discipline, T>;

export default function Home() {
  const projects = getProjects();

  return (
    <>
      {/* The dot field sits behind the hero and fades out at the edges and towards the work. */}
      <div className="relative isolate">
        <DotField className="absolute inset-0 -z-10 size-full [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,black_35%,transparent_100%)]" />
        <Hero headline="Brand, interface and print." intro={site.intro} />
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
