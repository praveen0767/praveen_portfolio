"use client";

import { useEffect, useRef } from "react";
import type { ElementType, ReactNode } from "react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/motion-env";

type MagneticProps = {
  children: ReactNode;
  /** Pull distance in px at the edge of the element. */
  strength?: number;
  className?: string;
  as?: ElementType;
};

/**
 * Magnetic hover. Elements within `strength` px are nudged toward the pointer,
 * then spring back on leave. Disabled for reduced motion and coarse pointers, so
 * touch devices and keyboard users get the untouched element.
 */
export function Magnetic({ children, strength = 14, className = "", as: Tag = "span" }: MagneticProps) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion() || !hasFinePointer()) return;

    const write = (x: number, y: number) => {
      node.style.setProperty("--mag-x", `${x.toFixed(2)}px`);
      node.style.setProperty("--mag-y", `${y.toFixed(2)}px`);
    };

    const onMove = (event: PointerEvent) => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const rect = node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        // Falloff over twice the half-size keeps the pull local to the element.
        const reach = Math.max(rect.width, rect.height);
        write((dx / reach) * strength, (dy / reach) * strength);
      });
    };

    const onLeave = () => {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
      }
      write(0, 0);
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <Tag
      ref={ref}
      className={`magnetic ${className}`.trim()}
      style={{ "--mag-x": "0px", "--mag-y": "0px" } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}