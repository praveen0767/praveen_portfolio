"use client";

import { m, useInView } from "motion/react";
import { useRef } from "react";

/**
 * The trajectory strip on the proof wall.
 *
 * Steps light up in order once the strip is in view, so the record reads as a
 * sequence rather than five equal labels. The steps themselves are the verified
 * `trajectory` strings passed from the server component — this only sequences
 * their reveal.
 */
export function TrajectorySequence({
  steps,
  accents,
}: {
  steps: string[];
  accents: string[];
}) {
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <ol className="proof-trajectory__list" ref={ref}>
      {steps.map((step, index) => (
        <li key={step} data-accent={accents[index % accents.length]}>
          <m.span
            className="proof-trajectory__dot"
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
            transition={{
              duration: 0.32,
              delay: inView ? index * 0.11 : 0,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          />
          <m.span
            initial={{ opacity: 0, x: -6 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
            transition={{
              duration: 0.34,
              delay: inView ? index * 0.11 : 0,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {step}
          </m.span>
        </li>
      ))}
    </ol>
  );
}