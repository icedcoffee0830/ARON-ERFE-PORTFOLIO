"use client";

import { MotionConfig } from "motion/react";

/*
  Server and client render identical animation props; Motion itself drops
  transform and layout animation for visitors who prefer reduced motion
  (opacity fades remain). Branching on useReducedMotion() in render instead
  causes a hydration mismatch that can leave content stuck at opacity 0.
*/
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
