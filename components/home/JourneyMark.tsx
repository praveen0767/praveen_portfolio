import type { ReactNode } from "react";
import type { Project } from "../../content/projects";
import type { CareerEventType } from "../../content/career";

type MarkProps = {
  project?: Project;
  type: CareerEventType;
  size?: number;
};

/**
 * Small original marks for the journey rows.
 *
 * There are no project logos in this repository — none of these builds has a
 * commercial brand identity — so nothing here imitates one. Each mark is drawn
 * from the same architecture the project's own glyph draws (see
 * `components/work/ProjectGlyph.tsx`), reduced to the one shape that still
 * reads at 30px:
 *
 *   ARIV        policy shield + confirmation check on a filled plate, so the
 *               flagship row carries the strongest mark
 *   SodhaneGPT entity-graph nodes and wires
 *   Info-i      three input lanes converging on one verification node
 *   Hazard Det  detection frame corners around the detected object
 *
 * Education, internship and milestone rows get an honest contextual icon
 * (graduation cap, work case, flag) instead of an invented company logo.
 * Everything inherits `currentColor`, so the row's existing `data-accent`
 * picks the palette and all marks stay one visual family.
 */
export function JourneyMark({ project, type, size = 30 }: MarkProps) {
  const strong = project?.slug === "ariv-agentic-revenue-recovery";
  const motif: ReactNode = project ? PROJECT_MOTIFS[project.slug] : TYPE_MOTIFS[type];

  if (!motif) {
    /* No motif for this record: an honest monogram, never a fake logo. */
    return (
      <span className="journey__mark journey__mark--mono" aria-hidden="true">
        {initials(project?.title ?? type)}
      </span>
    );
  }

  return (
    <svg
      className={`journey__mark${strong ? " journey__mark--strong" : ""}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        className={`journey__mark-plate${strong ? " journey__mark-plate--fill" : ""}`}
        x="1"
        y="1"
        width="30"
        height="30"
        rx="9"
      />
      {motif}
    </svg>
  );
}

function initials(title: string) {
  return title
    .split(/[^A-Za-z0-9+]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const PROJECT_MOTIFS: Record<string, ReactNode> = {
  /* Authority the payment loop ends on: policy approves, provider confirms. */
  "ariv-agentic-revenue-recovery": (
    <g className="journey__mark-art journey__mark-art--knock">
      <path d="M16 5.5 25 9 v6.5 c0 5.2 -3.6 8.8 -9 11 c-5.4 -2.2 -9 -5.8 -9 -11 V9 Z" />
      <path d="M12.2 15.9 l2.7 2.7 4.9 -5.5" />
    </g>
  ),
  /* Entity graph — the shape its glyph draws for crime records. */
  "sodhanegpt-crime-intelligence-platform": (
    <g className="journey__mark-art">
      <path d="M11 12.5 L21 15.5 M11 12.5 L14.2 22 M21 15.5 L14.2 22" />
      <circle className="journey__mark-solid" cx="11" cy="12.5" r="2.5" />
      <circle className="journey__mark-solid" cx="21" cy="15.5" r="2.5" />
      <circle className="journey__mark-solid" cx="14.2" cy="22" r="2.5" />
    </g>
  ),
  /* Text / image / audio lanes converging on one verification node. */
  "info-i-veritrust-agent": (
    <g className="journey__mark-art">
      <path d="M6.5 10 H12.5 M6.5 16 H12.5 M6.5 22 H12.5" />
      <path d="M12.5 10 L17 16 M12.5 16 H17 M12.5 22 L17 16" />
      <circle className="journey__mark-solid" cx="21" cy="16" r="4" />
    </g>
  ),
  /* Detection frame around the object the edge model finds. */
  "hazard-det-road-intelligence-system": (
    <g className="journey__mark-art">
      <path d="M7.5 11.5 V8 H11 M24.5 11.5 V8 H21 M7.5 20.5 V24 H11 M24.5 20.5 V24 H21" />
      <rect className="journey__mark-line" x="12" y="12" width="8" height="8" rx="2" />
      <circle className="journey__mark-solid" cx="16" cy="16" r="1.9" />
    </g>
  ),
};

const TYPE_MOTIFS: Record<CareerEventType, ReactNode> = {
  EDUCATION: (
    <g className="journey__mark-art">
      <path d="M16 8.5 L25.5 12.75 L16 17 L6.5 12.75 Z" />
      <path d="M10.5 14.8 v4.8 c0 1.8 2.5 3.2 5.5 3.2 s5.5 -1.4 5.5 -3.2 v-4.8" />
      <path d="M25.5 12.75 v4.6" />
      <circle className="journey__mark-solid" cx="25.5" cy="18.6" r="1.4" />
    </g>
  ),
  EXPERIENCE: (
    <g className="journey__mark-art">
      <rect className="journey__mark-line" x="6.5" y="12" width="19" height="12.5" rx="2.5" />
      <path d="M12 12 V9.8 a2 2 0 0 1 2 -2 h4 a2 2 0 0 1 2 2 V12" />
      <path d="M6.5 17.6 H25.5" />
      <rect className="journey__mark-solid" x="14.6" y="15.9" width="2.8" height="4.4" rx="1.2" />
    </g>
  ),
  /* A project row with no related project record falls back to the monogram. */
  PROJECT: null,
  MILESTONE: (
    <g className="journey__mark-art">
      <path d="M11 25.5 V6.5" />
      <path d="M11 7.5 H22 L19 11.5 L22 15.5 H11" />
    </g>
  ),
};
