import { site } from "@/content/site";
import { disciplines, getProjects, type Discipline } from "@/content/projects";
import { Hero, type HeroCover } from "@/components/Hero";
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
      ? [{ discipline: d, slug: p.slug, title: p.title, src: p.cover.src, alt: p.cover.alt, ratio: disciplines[d].ratio }]
      : [];
  });

  return (
    <>
      <Hero intro={site.intro} words={pick((d) => disciplines[d].word)} covers={covers} />
      <WorkIndex
        items={projects.map(({ slug, title, discipline, year, cover }) => ({
          slug,
          title,
          discipline,
          year,
          cover,
        }))}
        labels={pick((d) => disciplines[d].label)}
        ratios={pick((d) => disciplines[d].ratio)}
      />
      <About />
      <Contact email={site.email} links={site.links} />
    </>
  );
}
