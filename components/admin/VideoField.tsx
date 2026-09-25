"use client";

import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import type { Block } from "@/content/projects";
import { parseVideo, providerName, videoShapes, type VideoShape } from "@/lib/video";
import { VideoEmbed } from "../VideoEmbed";
import { Select, TextInput } from "./ui";

type VideoBlock = Extract<Block, { type: "video" }>;

export function VideoField({ block: b, onChange }: { block: VideoBlock; onChange: (b: VideoBlock) => void }) {
  const video = b.url.trim() ? parseVideo(b.url) : null;
  const defaultShape: VideoShape = video?.provider === "youtube" && video.vertical ? "9 / 16" : "16 / 9";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <TextInput
          label="Video link"
          value={b.url}
          onChange={(url) => {
            // A pasted Shorts link switches to the vertical shape automatically.
            const v = parseVideo(url);
            const vertical = v?.provider === "youtube" && v.vertical;
            onChange({ ...b, url, ratio: vertical && !b.ratio ? "9 / 16" : b.ratio });
          }}
          placeholder="https://youtu.be/… or https://drive.google.com/file/d/…"
          spellCheck={false}
          inputMode="url"
        />
        {b.url.trim() === "" ? (
          <p className="text-[13px] leading-snug text-muted">
            Paste the share link from YouTube, Google Drive or Vimeo.
          </p>
        ) : video ? (
          <p className="flex items-start gap-2 text-[13px] leading-snug">
            <CheckCircle size={16} weight="fill" className="mt-px shrink-0" />
            <span>
              {providerName[video.provider]} video found.
              {video.provider === "drive" &&
                " In Google Drive, set sharing to “Anyone with the link” or visitors will see a sign-in message instead."}
              {video.provider === "youtube" &&
                " Set it to Public or Unlisted on YouTube. Private videos won't play for visitors."}
            </span>
          </p>
        ) : (
          <p role="alert" className="flex items-start gap-2 text-[13px] leading-snug text-accent">
            <WarningCircle size={16} className="mt-px shrink-0" />
            This link isn't a YouTube, Google Drive or Vimeo video. Use the Share button on the video and copy that link.
          </p>
        )}
      </div>

      {video && (
        <>
          <div className="border border-line p-3">
            <VideoEmbed url={b.url} ratio={b.ratio ?? defaultShape} title="Preview" />
          </div>
          <Select<VideoShape>
            label="Shape"
            value={(b.ratio as VideoShape) ?? defaultShape}
            options={(Object.keys(videoShapes) as VideoShape[]).map((s) => ({ value: s, label: videoShapes[s] }))}
            onChange={(ratio) => onChange({ ...b, ratio })}
          />
          <TextInput
            label="Caption (optional)"
            hint="Shown under the video, e.g. what it is or where it was shown."
            value={b.caption ?? ""}
            onChange={(caption) => onChange({ ...b, caption })}
          />
        </>
      )}
    </div>
  );
}
