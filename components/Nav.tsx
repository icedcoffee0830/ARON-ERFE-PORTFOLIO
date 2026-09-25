import Link from "next/link";
import { site } from "@/content/site";

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
        className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8"
      >
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {site.name}
        </Link>
        <ul className="flex items-center gap-6 text-sm md:gap-10">
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
      </nav>
    </header>
  );
}
