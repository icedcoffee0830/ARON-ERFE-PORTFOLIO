import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { EditLink } from "@/components/EditLink";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <EditLink />
    </>
  );
}
