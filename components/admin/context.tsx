"use client";

import { createContext, useContext } from "react";

export type Uploaded = { path: string; width: number; height: number };

export type EditorApi = {
  /** Compresses and uploads an image into /work/<folder>/ (or the portrait slot). */
  upload: (file: File, folder: string) => Promise<Uploaded>;
  /** Maps a stored src to something the browser can show right now (fresh uploads use a local preview). */
  resolve: (src: string) => string;
};

export const EditorContext = createContext<EditorApi | null>(null);

export function useEditor() {
  const api = useContext(EditorContext);
  if (!api) throw new Error("useEditor must be used inside the editor.");
  return api;
}
