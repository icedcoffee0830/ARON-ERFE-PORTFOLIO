/**
 * Site-wide settings. Everything marked TODO is still undecided in PRODUCT.md
 * and must be confirmed by the owner before launch.
 */
export const site = {
  // TODO: confirm display name.
  name: "Aron",
  role: "Designer",
  intro:
    "Aron is a designer making brand identities, product interfaces and printed matter.",
  // TODO: replace with your own words. Keep it to what is true today.
  statement:
    "I design brand identities, digital product interfaces and printed matter. Each project gets the form its medium asks for: a system for a brand, a flow for a product, paper and ink for print.",
  // TODO: add a real portrait at /public/portrait.jpg and set this to "/portrait.jpg". Leave null to hide it.
  portrait: null as string | null,
  // TODO: set the real contact address.
  email: "hello@example.com",
  // Add profiles as { label: "Instagram", href: "https://..." }. Empty entries are not rendered.
  links: [] as { label: string; href: string }[],
  // Sample projects are drafts. They show in `next dev` and are hidden from production builds
  // unless this is true. Replace them with real work before flipping it.
  showDraftsInProduction: false,
};
