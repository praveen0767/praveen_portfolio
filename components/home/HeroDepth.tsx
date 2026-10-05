"use client";

import { useEffect, useRef } from "react";
import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import { hasFinePointer, prefersReducedMotion } from "../../lib/motion-env";

/**
 * Pointer-reactive hero depth.
 *
 * Each layer tracks the pointer through its own spring, so the copy, the desk and
 * the ambient rings settle at different rates. That difference is what reads as
 * depth — without it, everything moving together looks like the whole page is
 * sliding.
 *
 * The springs are attached to the viewport-relative normalised pointer, so this
 * costs one listener and never triggers a React render: the values are written
 * straight to transforms.
 *
 * Disabled wholesale for reduced motion and coarse pointers, where the layers
 * simply stay at rest in the middle.
 */
export function HeroDepth({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useRef(false);

  // Resolved once on mount rather than per pointer event: matchMedia in a move
  // handler would query the media engine on every frame of the drag.
  useEffect(() => {
    enabled.current = !prefersReducedMotion() && hasFinePointer();
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // A soft spring keeps the motion continuous rather than snapping to the cursor.
  const sx = useSpring(x, { stiffness: 90, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 90, damping: 22, mass: 0.6 });

  // Slower, heavier spring for the far layer.
  const bx = useSpring(x, { stiffness: 45, damping: 26, mass: 0.9 });
  const by = useSpring(y, { stiffness: 45, damping: 26, mass: 0.9 });

  const nearX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const nearY = useTransform(sy, [-0.5, 0.5], [-10, 10]);
  const farX = useTransform(bx, [-0.5, 0.5], [26, -26]);
  const farY = useTransform(by, [-0.5, 0.5], [18, -18]);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!enabled.current) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onPointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div ref={ref} className="hero__depth" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <m.div className="hero__depth-back" aria-hidden="true" style={{ x: farX, y: farY }} />
      <m.div className="hero__depth-near" style={{ x: nearX, y: nearY }}>
        {children}
      </m.div>
    </div>
  );
}