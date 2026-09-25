/*
  Turns a pasted share link into something embeddable. Used by the editor (to
  preview and validate) and by the site (to render). Only these hosts are
  accepted, so a project page can never embed an arbitrary website.
*/

export type Video =
  | { provider: "youtube"; id: string; embed: string; thumb: string; vertical: boolean }
  | { provider: "drive"; id: string; embed: string }
  | { provider: "vimeo"; id: string; embed: string };

export const providerName: Record<Video["provider"], string> = {
  youtube: "YouTube",
  drive: "Google Drive",
  vimeo: "Vimeo",
};

export function parseVideo(input: string): Video | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "youtu.be" || host === "music.youtube.com") {
    let id: string | null = null;
    let vertical = false;
    if (host === "youtu.be") id = parts[0] ?? null;
    else if (parts[0] === "watch") id = url.searchParams.get("v");
    else if (parts[0] === "shorts") {
      id = parts[1] ?? null;
      vertical = true;
    } else if (parts[0] === "embed" || parts[0] === "live" || parts[0] === "v") id = parts[1] ?? null;
    if (!id || !/^[\w-]{11}$/.test(id)) return null;
    return {
      provider: "youtube",
      id,
      vertical,
      embed: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`,
      thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  if (host === "drive.google.com") {
    // /file/d/<id>/view, /file/d/<id>/preview, or /open?id=<id>
    const id = parts[0] === "file" && parts[1] === "d" ? parts[2] : url.searchParams.get("id");
    if (!id || !/^[\w-]{10,}$/.test(id)) return null;
    return { provider: "drive", id, embed: `https://drive.google.com/file/d/${id}/preview` };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = parts.find((p) => /^\d{5,}$/.test(p));
    if (!id) return null;
    return { provider: "vimeo", id, embed: `https://player.vimeo.com/video/${id}?dnt=1` };
  }

  return null;
}

export const videoShapes = {
  "16 / 9": "Landscape (16:9)",
  "9 / 16": "Vertical (9:16), for Shorts and Reels",
  "1 / 1": "Square (1:1)",
  "4 / 5": "Portrait (4:5)",
} as const;

export type VideoShape = keyof typeof videoShapes;
