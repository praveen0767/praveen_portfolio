"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/motion-env";

type TiltCardProps = {
  children: ReactNode;
  /** Maximum rotation in degrees on each axis. */
  strength?: number;
  /** How far the card lifts toward the viewer, in px. */
  lift?: number;
  className?: string;
};

/**
 * Pointer-driven 3D tilt.
 *
 * Writes two custom properties (`--tilt-x`, `--tilt-y`) instead of inline
 * transform strings, so the CSS owns the whole transform stack and the JS stays
 * a single cheap style write. No layout reads, no React re-render per frame.
 */
export function TiltCard({ children, strength = 7, lift = 14, className = "" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion() || !hasFinePointer()) return;

    const write = (rx: number, ry: number, rz: number) => {
      node.style.setProperty("--tilt-x", rx.toFixed(3));
      node.style.setProperty("--tilt-y", ry.toFixed(3));
      node.style.setProperty("--tilt-lift", `${rz}px`);
    };

    const onMove = (event: PointerEvent) => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const rect = node.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        write(-py * strength * 2, px * strength * 2, lift);
      });
    };

    const onEnter = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      write(-py * strength * 2, px * strength * 2, lift);
    };

    const onLeave = () => {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
      }
      write(0, 0, 0);
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerenter", onEnter);
    node.addEventListener("pointerleave", onLeave);

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerenter", onEnter);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [strength, lift]);

  return (
    <div ref={ref} className={`tilt ${className}`.trim()} style={{ "--tilt-x": "0deg", "--tilt-y": "0deg", "--tilt-lift": "0px" } as React.CSSProperties}>
      {children}
    </div>
  );
}