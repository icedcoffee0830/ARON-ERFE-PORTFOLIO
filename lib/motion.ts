/*
  Shared motion values for overlays. Enters use a soft spring (no overshoot) plus
  opacity, a small translate and blur, so things "come into focus". Exits are
  shorter and smaller than enters: attention has already moved on.
*/

/** Strong ease-out: fast start, long gentle landing. For things arriving. */
export const easeOut = [0.16, 1, 0.3, 1] as const;
/** Ease-in: gentle start, quick finish. For things leaving. */
export const easeIn = [0.4, 0, 1, 1] as const;
/** Production spring: smooth deceleration, no bounce. */
export const springSoft = { type: "spring", duration: 0.45, bounce: 0 } as const;
