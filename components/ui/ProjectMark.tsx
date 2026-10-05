import type { ReactNode } from "react";

type ProjectMarkProps = {
  slug?: string;
  title?: string;
  size?: number;
  className?: string;
  strong?: boolean;
};

/**
 * Compact original project identity marks.
 *
 * Built directly from each system's verified architecture and data flow,
 * not commercial company branding or fake internet logos:
 *
 *   01 ARIV:       control-plane policy shield + confirmation checkmark on a prominent plate
 *   02 Info-i:     three multimodal input lanes converging on a verification node
 *   03 SodhaneGPT: entity-graph nodes and relationship wires
 *   04 Hazard Det: edge camera detection corners around a localized hazard
 *
 * Desktop target: 28–40px
 * Mobile target:  24–32px
 */
export function ProjectMark({
  slug = "",
  title = "",
  size,
  className = "",
  strong,
}: ProjectMarkProps) {
  const normalizedSlug = normalizeSlug(slug || title);
  const isFlagship = strong ?? (normalizedSlug === "ariv-agentic-revenue-recovery" || normalizedSlug === "ariv");
  const motif = PROJECT_MOTIFS[normalizedSlug];

  const style = size
    ? ({
        "--mark-size": `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
      } as React.CSSProperties)
    : undefined;

  if (!motif) {
    const mono = initials(title || slug);
    return (
      <span
        className={`project-mark project-mark--mono ${className}`.trim()}
        style={style}
        aria-hidden="true"
      >
        {mono}
      </span>
    );
  }

  return (
    <svg
      className={`project-mark${isFlagship ? " project-mark--flagship" : ""} ${className}`.trim()}
      width={size ?? 32}
      height={size ?? 32}
      viewBox="0 0 32 32"
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        className={`project-mark__plate${isFlagship ? " project-mark__plate--fill" : ""}`}
        x="1.5"
        y="1.5"
        width="29"
        height="29"
        rx="8"
      />
      {motif}
    </svg>
  );
}

function normalizeSlug(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("ariv")) return "ariv-agentic-revenue-recovery";
  if (lower.includes("info-i") || lower.includes("veritrust")) return "info-i-veritrust-agent";
  if (lower.includes("sodhane")) return "sodhanegpt-crime-intelligence-platform";
  if (lower.includes("hazard")) return "hazard-det-road-intelligence-system";
  return lower;
}

function initials(text: string): string {
  return text
    .split(/[^A-Za-z0-9+]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export const PROJECT_MOTIFS: Record<string, ReactNode> = {
  /* 01 ARIV: Policy shield + confirmation checkmark on a filled/accent plate */
  "ariv-agentic-revenue-recovery": (
    <g className="project-mark__art project-mark__art--knock">
      <path d="M16 5.5 25 9 v6.5 c0 5.2 -3.6 8.8 -9 11 c-5.4 -2.2 -9 -5.8 -9 -11 V9 Z" />
      <path d="M12.2 15.9 l2.7 2.7 4.9 -5.5" />
    </g>
  ),

  /* 02 Info-i / VeriTrust: 3 input lanes converging into verification node */
  "info-i-veritrust-agent": (
    <g className="project-mark__art">
      <path d="M6.5 10 H12.5 M6.5 16 H12.5 M6.5 22 H12.5" />
      <path d="M12.5 10 L17 16 M12.5 16 H17 M12.5 22 L17 16" />
      <circle className="project-mark__solid" cx="21" cy="16" r="4" />
    </g>
  ),

  /* 03 SodhaneGPT: Entity graph nodes and interconnecting wires */
  "sodhanegpt-crime-intelligence-platform": (
    <g className="project-mark__art">
      <path d="M11 12.5 L21 15.5 M11 12.5 L14.2 22 M21 15.5 L14.2 22" />
      <circle className="project-mark__solid" cx="11" cy="12.5" r="2.5" />
      <circle className="project-mark__solid" cx="21" cy="15.5" r="2.5" />
      <circle className="project-mark__solid" cx="14.2" cy="22" r="2.5" />
    </g>
  ),

  /* 04 Hazard Det: Edge detection frame corners with localized detection */
  "hazard-det-road-intelligence-system": (
    <g className="project-mark__art">
      <path d="M7.5 11.5 V8 H11 M24.5 11.5 V8 H21 M7.5 20.5 V24 H11 M24.5 20.5 V24 H21" />
      <rect className="project-mark__line" x="12" y="12" width="8" height="8" rx="2" />
      <circle className="project-mark__solid" cx="16" cy="16" r="1.9" />
    </g>
  ),
};
