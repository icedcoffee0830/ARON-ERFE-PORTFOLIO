import Image from "next/image";
import { site } from "@/content/site";
import { disciplines, type Discipline } from "@/content/projects";
import { Reveal } from "./Reveal";

export function About() {
  const keys = Object.keys(disciplines) as Discipline[];
  return (
    <section id="about" className="bg-bg-sunk">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-4 py-24 md:grid-cols-12 md:gap-8 md:px-8 md:py-36">
        <h2 className="sr-only">About</h2>
        {site.portrait && (
          <Reveal className="md:col-span-4">
            <div className="relative aspect-[4/5] overflow-hidden bg-bg">
              <Image
                src={site.portrait}
                alt={`Portrait of ${site.name}`}
                fill
                sizes="(min-width: 768px) 30vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        )}
        <div className={site.portrait ? "md:col-span-7 md:col-start-6" : "md:col-span-10"}>
          <Reveal>
            <p className="text-[clamp(1.75rem,3.2vw,3rem)] font-medium leading-[1.12] tracking-[-0.03em]">
              {site.statement}
            </p>
          </Reveal>
          <dl className="mt-16 grid gap-8 md:mt-24 md:grid-cols-[minmax(0,14rem)_1fr] md:gap-x-12">
            {keys.map((d, i) => (
              <Reveal
                key={d}
                delay={i * 0.06}
                className="grid gap-1 md:col-span-2 md:grid-cols-subgrid md:gap-x-12"
              >
                <dt className="font-medium">{disciplines[d].label}</dt>
                <dd className="max-w-[48ch] text-muted">{disciplines[d].description}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
