"use client";

import { useEffect, useRef } from "react";
import { arivStages } from "../../content/ariv";
import { prefersReducedMotion } from "../../lib/motion-env";

/**
 * Seeded motes. Positions come from a fixed table rather than `Math.random()` so
 * the server and client render the same markup and hydration never mismatches.
 */
const MOTES = [
  { left: "18%", delay: 0, duration: 7.4, size: 3 },
  { left: "31%", delay: 1.1, duration: 9.2, size: 2 },
  { left: "44%", delay: 0.5, duration: 8.1, size: 3 },
  { left: "56%", delay: 2.2, duration: 10.4, size: 2 },
  { left: "69%", delay: 1.4, duration: 7.9, size: 3 },
  { left: "81%", delay: 0.2, duration: 9.7, size: 2 },
  { left: "91%", delay: 3, duration: 8.6, size: 3 },
] as const;

/** Where each lane converges, as a percentage of the handoff width. */
const CONVERGE = [
  { left: "22%", to: "46%", duration: 7.2, delay: 0 },
  { left: "35%", to: "48.5%", duration: 8.4, delay: 0.7 },
  { left: "50%", to: "50%", duration: 6.4, delay: 0.3 },
  { left: "65%", to: "51.5%", duration: 8.8, delay: 1.4 },
  { left: "79%", to: "54%", duration: 7.7, delay: 0.5 },
] as const;

/**
 * The bridge between "me" and "what I built".
 *
 * The hero's floating technical particles leave their stage here, fall down the
 * page as falling motes, and converge on a single node — the first node of the
 * ARIV control plane. The typography recedes as it goes, so scrolling out of the
 * hero reads as entering a system rather than leaving a landing page.
 *
 * It is a short band on purpose. The story has to keep moving, so this does the
 * hand-off and gets out of the way in roughly half a viewport.
 *
 * Motion is one passive scroll listener writing a single custom property, gated
 * on the band being on screen and skipped entirely under reduced motion.
 */
export function HeroHandoff() {
  const bandRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = bandRef.current;
    if (!node) return;
    if (prefersReducedMotion()) return;
    if (typeof IntersectionObserver === "undefined") return;

    let onScreen = false;
    let ticking = false;
    let frame = 0;

    const apply = () => {
      ticking = false;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // 0 when the band is one viewport below the fold, 1 when it has left the top.
      const progress = (viewport - rect.top) / (viewport + rect.height);
      node.style.setProperty("--handoff", progress.toFixed(4));
    };

    const schedule = () => {
      if (ticking || !onScreen) return;
      ticking = true;
      frame = requestAnimationFrame(apply);
    };

    apply();

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        if (onScreen) schedule();
      },
      { rootMargin: "40% 0px" },
    );
    observer.observe(node);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="handoff" ref={bandRef} aria-labelledby="handoff-title">
      <div className="handoff__lanes" aria-hidden="true">
        {CONVERGE.map((lane, index) => (
          <span
            key={lane.to}
            className="handoff__lane"
            style={
              {
                left: lane.left,
                "--lane-to": lane.to,
                "--lane-duration": `${lane.duration}s`,
                "--lane-delay": `${lane.delay}s`,
                "--lane-index": index,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="handoff__motes" aria-hidden="true">
        {MOTES.map((mote, index) => (
          <span
            key={mote.left}
            className="handoff__mote"
            style={
              {
                left: mote.left,
                width: mote.size,
                height: mote.size,
                animationDuration: `${mote.duration}s`,
                animationDelay: `${mote.delay}s`,
                "--mote-index": index,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="handoff__body">
        <p className="handoff__from" aria-hidden="true">
          Me
        </p>
        <span className="handoff__arrow" aria-hidden="true">
          ↓
        </span>

        <div className="handoff__to">
          <p className="handoff__eyebrow">What I built</p>
          <h2 className="handoff__title" id="handoff-title">
            Start with the system I can defend.
          </h2>
          <p className="handoff__lede">
            One flagship project leads the work: {arivStages.length} stages from a failed payment to a
            provider-confirmed recovery, with every hand-off named.
          </p>
        </div>
      </div>

      <a className="handoff__entry" href="#ariv">
        <span className="handoff__entry-node" aria-hidden="true">
          <span className="handoff__entry-core" />
        </span>
        <span className="handoff__entry-label">
          <span className="handoff__entry-index">01</span>
          ARIV
        </span>
      </a>
    </section>
  );
}
