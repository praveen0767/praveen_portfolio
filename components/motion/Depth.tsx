import type { CSSProperties, ReactNode } from "react";

/**
 * Server-rendered depth primitives. No JS: the depth comes from transform and
 * z-index, and motion is pure CSS so it is free and interruptible.
 */

/** 1 = nearest the viewer, 3 = furthest back. */
export type Depth = 1 | 2 | 3;

type FloatingObjectProps = {
  children: ReactNode;
  /** Where the object is anchored on the parent. */
  position?: { top?: string; right?: string; bottom?: string; left?: string };
  depth?: Depth;
  /** Drift distance in px and duration in seconds. */
  drift?: number;
  duration?: number;
  delay?: number;
  accent?: "electric" | "violet" | "cyan" | "lime" | "orange" | "pink";
  className?: string;
};

export function FloatingObject({
  children,
  position,
  depth = 2,
  drift = 8,
  duration = 8,
  delay = 0,
  accent,
  className = "",
}: FloatingObjectProps) {
  const style: CSSProperties = {
    ...(position ?? {}),
    "--float-x": `${drift * 0.4}px`,
    "--float-y": `${drift}px`,
    "--float-duration": `${duration}s`,
    "--float-delay": `${delay}s`,
  } as CSSProperties;

  if (accent) (style as Record<string, string>)["--accent"] = `var(--a-${accent})`;

  return (
    <div className={`floating-object ${className}`.trim()} data-depth={depth} data-accent={accent} style={style}>
      {children}
    </div>
  );
}

/**
 * A decorative layer that sits behind or in front of the scene. Content is
 * presentational only and must not carry meaning.
 */
export function DepthLayer({
  children,
  depth = 3,
  className = "",
  style,
}: {
  children: ReactNode;
  depth?: Depth;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`depth-layer ${className}`.trim()} data-depth={depth} style={style}>
      {children}
    </div>
  );
}

type OrbitRingProps = {
  /** Ring diameters in px, drawn from the outside in. */
  sizes: number[];
  duration?: number;
  reverse?: boolean;
  className?: string;
};

/** Concentric rotating rings used behind the portrait. Decorative. */
export function OrbitRing({ sizes, duration = 40, reverse = false, className = "" }: OrbitRingProps) {
  return (
    <div
      className="orbit orbit--spin"
      aria-hidden="true"
      style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
    >
      {sizes.map((size) => (
        <span key={size} className={`orbit__ring ${className}`.trim()} style={{ width: size, height: size }} />
      ))}
    </div>
  );
}

/**
 * Drifting particles. Positions are generated from a fixed seed so the server
 * and client always agree — no hydration mismatch and no Math.random().
 */
const PARTICLES = [
  { top: "12%", left: "18%", size: 3, delay: 0, duration: 11, accent: "electric" },
  { top: "28%", left: "82%", size: 4, delay: 1.6, duration: 13, accent: "violet" },
  { top: "62%", left: "8%", size: 3, delay: 3.1, duration: 12, accent: "cyan" },
  { top: "76%", left: "74%", size: 5, delay: 0.8, duration: 15, accent: "pink" },
  { top: "44%", left: "92%", size: 3, delay: 4.2, duration: 14, accent: "orange" },
  { top: "88%", left: "34%", size: 4, delay: 2.4, duration: 12.5, accent: "lime" },
] as const;

export function ParticleField({ className = "" }: { className?: string }) {
  return (
    <div className={`particles ${className}`.trim()} aria-hidden="true">
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="particle float"
          data-accent={particle.accent}
          style={
            {
              top: particle.top,
              left: particle.left,
              width: particle.size,
              height: particle.size,
              "--float-x": "8px",
              "--float-y": "-14px",
              "--float-duration": `${particle.duration}s`,
              "--float-delay": `${particle.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}