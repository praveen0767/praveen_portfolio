"use client";

/**
 * Motion and pointer environment checks.
 *
 * These are deliberately plain functions, not hooks: they read the environment at
 * the moment an effect attaches, which is exactly where the value matters. Every
 * interactive component gates its pointer work through them, so a reduced-motion
 * visitor never gets a rAF loop, tilt or parallax — only the static end state,
 * which is also the keyboard end state.
 */

/** True when the visitor asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True only for devices with a real pointer that can hover. */
export function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}