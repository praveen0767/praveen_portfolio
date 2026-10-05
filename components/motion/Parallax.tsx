"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/motion-env";

type ParallaxProps = {
  children: ReactNode;
  /** Maximum vertical travel in px across the visible range. */
  distance?: number;
  className?: string;
  /**
   * Extra styles for the wrapper. Useful when the wrapper takes over the
   * positioning of an absolutely-positioned decorative layer, so the parallax
   * transform has a real box to move.
   */
  style?: CSSProperties;
};

/**
 * Scroll-driven parallax. A single passive scroll listener writes one custom
 * property per frame, and only while the section is on screen.
 */
export function Parallax({ children, distance = 28, className = "", style }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (prefersReducedMotion() || !hasFinePointer()) return;
    if (typeof IntersectionObserver === "undefined") return;

    let visible = false;
    let ticking = false;

    const apply = () => {
      ticking = false;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // -1 when the node is below the fold, +1 when above it.
      const progress = (viewport / 2 - (rect.top + rect.height / 2)) / (viewport / 2 + rect.height / 2);
      node.style.setProperty("--parallax", `${(progress * distance).toFixed(2)}px`);
    };

    const onScroll = () => {
      if (ticking || !visible) return;
      ticking = true;
      requestAnimationFrame(apply);
    };

    apply();

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) apply();
      },
      { rootMargin: "120px" },
    );
    observer.observe(node);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [distance]);

  return (
    <div
      ref={ref}
      className={`parallax ${className}`.trim()}
      style={{ "--parallax": "0px", ...style } as CSSProperties}
    >
      {children}
    </div>
  );
}