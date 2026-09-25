/*
  Software shown as lettered tiles (the same idea as the app icons, drawn in the
  site's own style rather than copying anyone's logo). Anything not listed here
  still works: its tile uses the first letters of the name.
*/

export const softwarePresets: { name: string; abbr: string }[] = [
  { name: "Photoshop", abbr: "Ps" },
  { name: "Illustrator", abbr: "Ai" },
  { name: "InDesign", abbr: "Id" },
  { name: "Premiere Pro", abbr: "Pr" },
  { name: "After Effects", abbr: "Ae" },
  { name: "Lightroom", abbr: "Lr" },
  { name: "Audition", abbr: "Au" },
  { name: "Figma", abbr: "Fg" },
  { name: "Canva", abbr: "Cv" },
  { name: "CapCut", abbr: "Cc" },
  { name: "DaVinci Resolve", abbr: "Dr" },
  { name: "Blender", abbr: "Bl" },
  { name: "Procreate", abbr: "Pc" },
  { name: "CorelDRAW", abbr: "Cd" },
];

export function abbrOf(name: string) {
  const preset = softwarePresets.find((p) => p.name.toLowerCase() === name.trim().toLowerCase());
  if (preset) return preset.abbr;
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : name.trim().slice(0, 2);
  return letters.charAt(0).toUpperCase() + letters.slice(1).toLowerCase();
}
