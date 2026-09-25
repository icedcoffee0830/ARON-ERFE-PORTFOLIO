import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main">
        <section className="mx-auto flex min-h-[70dvh] max-w-[1400px] flex-col justify-center px-4 py-24 md:px-8">
          <h1 className="text-[clamp(2.75rem,7vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
            Page not found.
          </h1>
          <p className="mt-6 max-w-[40ch] text-lg text-muted">
            This page does not exist, or the project has moved.
          </p>
          <Link
            href="/#work"
            className="mt-10 inline-flex h-12 w-fit items-center bg-fg px-6 font-medium text-bg transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            View work
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
