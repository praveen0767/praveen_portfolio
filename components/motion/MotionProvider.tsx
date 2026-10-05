"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";
import type { ReactNode } from "react";

/**
 * Scopes Framer Motion to the `domMax` feature set.
 *
 * Every motion component in the app must render `m.*` rather than `motion.*` —
 * `strict` turns a stray `motion.*` into a loud runtime error instead of a silent
 * full-bundle import.
 *
 * `domMax` rather than `domAnimation` specifically because the tech explorer
 * animates its filtered tile grid with `layout`. Without the projection feature
 * that prop does not throw — it is guarded out and silently does nothing, so the
 * reflow would look broken with no error to trace. Measured cost of the upgrade
 * was +0.8 KB gzip on the homepage, which is worth paying for a prop that works.
 *
 * `reducedMotion="user"` is load-bearing: the global CSS rule that zeroes
 * `animation-duration` cannot reach Framer Motion, because those animations are
 * driven from JavaScript rather than by a CSS keyframe. This prop makes every
 * `m.*` transform and layout animation collapse to an instant state change for
 * anyone who has asked for reduced motion.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}