"use client";

import { useState } from "react";
import { Play } from "@phosphor-icons/react";
import { parseVideo, providerName } from "@/lib/video";

/*
  YouTube shows its thumbnail and loads the player only on click, which keeps
  pages with several videos fast. Drive and Vimeo embed directly (lazy-loaded),
  since they have no public thumbnail to show first.
*/
export function VideoEmbed({
  url,
  ratio,
  caption,
  title = "Video",
}: {
  url: string;
  ratio?: string;
  caption?: string;
  title?: string;
}) {
  const video = parseVideo(url);
  const [playing, setPlaying] = useState(false);
  if (!video) return null;

  const shape = ratio ?? (video.provider === "youtube" && video.vertical ? "9 / 16" : "16 / 9");
  const [w, h] = shape.split("/").map((n) => Number(n.trim()));
  // Tall videos are narrowed so they fit on screen instead of running full width.
  const maxWidth = h > w ? "min(100%, 420px)" : h === w ? "min(100%, 720px)" : undefined;
  const label = caption || title;

  return (
    <figure className="mx-auto w-full" style={{ maxWidth }}>
      <div className="relative w-full overflow-hidden bg-bg-sunk" style={{ aspectRatio: shape }}>
        {video.provider === "youtube" && !playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${label}`}
            className="group absolute inset-0 size-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumb}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 bg-[#0d0d0c]/20 transition-colors group-hover:bg-[#0d0d0c]/30" />
            <span className="absolute left-1/2 top-1/2 inline-flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-[#f2f2f0] text-[#141414] shadow-[0_16px_40px_-16px_rgb(0_0_0/0.6)] transition-transform duration-300 ease-out-expo group-hover:scale-105">
              <Play size={30} weight="fill" className="translate-x-0.5" />
            </span>
          </button>
        ) : (
          <iframe
            src={video.provider === "youtube" ? `${video.embed}&autoplay=1` : video.embed}
            title={label}
            loading="lazy"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 size-full border-0"
          />
        )}
      </div>
      {caption && <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>}
      <noscript>
        <a href={url} className="mt-2 block text-sm underline">
          Watch on {providerName[video.provider]}
        </a>
      </noscript>
    </figure>
  );
}
