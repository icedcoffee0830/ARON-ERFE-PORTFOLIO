import Link from "next/link";
import { site } from "@/content/site";
import { MobileMenu } from "./MobileMenu";

const items = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-4 md:px-8"
      >
        <Link href="/" className="flex min-w-0 items-center gap-3 text-lg font-semibold tracking-tight">
          {site.logo ? (
            <>
              <picture className="flex shrink-0">
                {site.logoDark && (
                  <source srcSet={site.logoDark} media="(prefers-color-scheme: dark)" />
                )}
                {/* Plain img: logos are small, and SVGs pass through untouched. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={site.logo}
                  alt={site.showNameWithLogo ? "" : site.name}
                  className="h-8 w-auto max-w-[180px] object-contain object-left"
                />
              </picture>
              {site.showNameWithLogo && <span className="truncate">{site.name}</span>}
            </>
          ) : (
            site.name
          )}
        </Link>
        <ul className="hidden items-center gap-10 text-sm md:flex">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-muted transition-colors duration-200 hover:text-fg"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <MobileMenu items={items} email={site.email} />
      </nav>
    </header>
  );
}
