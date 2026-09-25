import Image from "next/image";
import { site } from "@/content/site";
import { disciplines, type Discipline } from "@/content/projects";
import { abbrOf } from "@/lib/software";
import { Reveal } from "./Reveal";

export function About() {
  const keys = Object.keys(disciplines) as Discipline[];
  // Older content may not have these lists yet.
  const skills = site.skills ?? [];
  const experience = site.experience ?? [];
  const software = site.software ?? [];
  const hasDetails = skills.length + experience.length + software.length > 0;

  return (
    <section id="about" className="bg-bg-sunk">
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-32">
        <h2 className="sr-only">About</h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          {site.portrait && (
            <Reveal className="max-w-[260px] md:col-span-4 md:max-w-none">
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
              <p className="max-w-[34ch] text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] tracking-[-0.025em]">
                {site.statement}
              </p>
            </Reveal>
            <dl className="mt-12 grid gap-6 md:mt-20 md:gap-8 md:grid-cols-[minmax(0,14rem)_1fr] md:gap-x-12">
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

        {hasDetails && (
          <div className="mt-14 grid grid-cols-1 gap-12 border-t border-line pt-10 md:mt-28 md:grid-cols-12 md:gap-8 md:pt-16">
            {experience.length > 0 && (
              <Reveal className="md:col-span-6">
                <h3 className="text-lg font-semibold tracking-tight">Experience</h3>
                <ol className="mt-6 divide-y divide-line">
                  {experience.map((e, i) => (
                    <li key={i} className="flex gap-6 py-5 first:pt-0">
                      {e.period && (
                        <span className="w-24 shrink-0 pt-0.5 font-mono text-sm text-muted">{e.period}</span>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium">{e.title}</p>
                        {e.detail && <p className="mt-1 max-w-[52ch] text-sm leading-relaxed text-muted">{e.detail}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            )}

            <div
              className={`flex flex-col gap-12 ${
                experience.length > 0 ? "md:col-span-5 md:col-start-8" : "md:col-span-12"
              }`}
            >
              {skills.length > 0 && (
                <Reveal delay={0.06}>
                  <h3 className="text-lg font-semibold tracking-tight">Soft skills</h3>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <li key={s} className="border border-line px-3 py-1.5 text-sm">
                        {s}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}

              {software.length > 0 && (
                <Reveal delay={0.12}>
                  <h3 className="text-lg font-semibold tracking-tight">Software</h3>
                  <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-6">
                    {software.map((name) => (
                      <li key={name} className="flex w-16 flex-col items-center gap-2 text-center">
                        <span
                          aria-hidden
                          className="flex size-16 items-center justify-center border-2 border-fg text-xl font-semibold tracking-tight"
                        >
                          {abbrOf(name)}
                        </span>
                        <span className="text-xs leading-tight text-muted">{name}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
