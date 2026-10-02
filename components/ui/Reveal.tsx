"use client";

import { useEffect, useRef } from "react";
import type { ElementType, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Stagger offset in milliseconds. */
  delay?: number;
  as?: ElementType;
};

/**
 * Scroll reveal built on IntersectionObserver.
 *
 * The hidden state is only applied to the DOM after mount, so server rendered
 * markup and no-JS visitors always see the content. Under
 * `prefers-reduced-motion: reduce` the CSS collapses the transition and the
 * element is revealed regardless.
 */
export function Reveal({ children, className = "", id, delay = 0, as: Tag = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    node.dataset.armed = "true";
    if (delay) node.style.transitionDelay = `${delay}ms`;

    const reveal = () => {
      node.dataset.visible = "true";
    };

    if (typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} id={id} className={`reveal ${className}`.trim()}>
      {children}
    </Tag>
  );
}