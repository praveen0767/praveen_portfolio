"use client";

import { useState } from "react";
import type { HTMLAttributes } from "react";
import { heroPillars } from "../../content/home";

type PillarId = "problem" | "architecture" | "software" | "ai" | "data" | "product" | "user";

type Accent = "electric" | "violet" | "cyan";

type Stage = {
  id: PillarId;
  label: string;
  detail: string;
};

/** PROBLEM → ARCHITECTURE → SOFTWARE / DATA / AI → PRODUCT → USER */
const stages: Stage[] = [
  {
    id: "problem",
    label: "Problem",
    detail: "Ambiguity narrowed into requirements, constraints and a definition of done.",
  },
  {
    id: "architecture",
    label: "Architecture",
    detail: "Components, interfaces, data flow and failure states chosen before build cost climbs.",
  },
  {
    id: "software",
    label: "Software",
    detail: "Backend services, APIs, web surfaces and databases that keep working after the demo.",
  },
  {
    id: "data",
    label: "Data",
    detail: "SQL, retrieval, vector search, pipelines and graph systems holding the evidence.",
  },
  {
    id: "ai",
    label: "AI",
    detail: "Machine learning, LLMs, RAG, agents and multimodal models where they add leverage.",
  },
  {
    id: "product",
    label: "Product",
    detail: "Features, interfaces and iteration driven by real usage.",
  },
  {
    id: "user",
    label: "User",
    detail: "Delivered value the system actually has to survive.",
  },
];

const stageById = (id: PillarId) => stages.find((stage) => stage.id === id)!;

/** Lane order left to right, matching the software → data → AI reading order. */
const laneOrder: PillarId[] = ["software", "data", "ai"];

const accents: Record<PillarId, Accent> = {
  problem: "electric",
  architecture: "electric",
  software: "electric",
  data: "cyan",
  ai: "violet",
  product: "electric",
  user: "electric",
};

/* Lane geometry, in viewBox units. */
const W = 460;
const ROWS = { problem: 0, architecture: 1, branches: 2, product: 3, user: 4 } as const;
const TOP = 30;
const ROW = 82;
const LANE_X = [86, 230, 374];

const rowY = (row: number) => TOP + row * ROW;
const H = rowY(ROWS.user) + 66;

export function SystemMap() {
  const [hovered, setHovered] = useState<PillarId | null>(null);
  const [pinned, setPinned] = useState<PillarId | null>(null);

  const shown = pinned ?? hovered;
  const detail = shown ? stageById(shown) : null;

  const interactiveProps = (stage: Stage): HTMLAttributes<SVGGElement> => ({
    onMouseEnter: () => setHovered(stage.id),
    onMouseLeave: () => setHovered(null),
    onFocus: () => setHovered(stage.id),
    onBlur: () => setHovered(null),
    onClick: () => setPinned((current) => (current === stage.id ? null : stage.id)),
  });

  return (
    <figure className="sysmap" data-active={shown ?? undefined}>
      <figcaption className="sysmap__caption">
        <span className="sysmap__label">{"// engineering.system"}</span>
        <span className="sysmap__hint">Hover or focus a node</span>
      </figcaption>

      <svg
        className="sysmap__svg"
        viewBox={`0 0 ${W} ${H}`}
        role="group"
        aria-label="Engineering system map. Problem flows to architecture, which splits across software, data and AI, then converges into product and user."
      >
        
        <path
          className="sysmap__wire"
          d={`M ${LANE_X[1]} ${rowY(ROWS.problem) + 25} L ${LANE_X[1]} ${rowY(ROWS.architecture) - 25}`}
        />
        <path
          className="sysmap__wire sysmap__wire--branch"
          d={`M ${LANE_X[1]} ${rowY(ROWS.architecture) + 25} L ${LANE_X[1]} ${rowY(ROWS.branches) - 34}
              M ${LANE_X[0]} ${rowY(ROWS.branches) - 34} L ${LANE_X[2]} ${rowY(ROWS.branches) - 34}`}
        />
        <path
          className="sysmap__wire sysmap__wire--branch"
          d={`M ${LANE_X[0]} ${rowY(ROWS.branches) + 25} L ${LANE_X[0]} ${rowY(ROWS.product) - 34}
              M ${LANE_X[2]} ${rowY(ROWS.branches) + 25} L ${LANE_X[2]} ${rowY(ROWS.product) - 34}
              M ${LANE_X[0]} ${rowY(ROWS.product) - 34} L ${LANE_X[2]} ${rowY(ROWS.product) - 34}`}
        />
        <path
          className="sysmap__wire"
          d={`M ${LANE_X[1]} ${rowY(ROWS.product) - 34} L ${LANE_X[1]} ${rowY(ROWS.product) - 25}`}
        />
        <path
          className="sysmap__wire"
          d={`M ${LANE_X[1]} ${rowY(ROWS.product) + 25} L ${LANE_X[1]} ${rowY(ROWS.user) - 25}`}
        />

        
        <path
          className="sysmap__signal"
          d={`M ${LANE_X[1]} ${rowY(ROWS.problem) + 25} L ${LANE_X[1]} ${rowY(ROWS.architecture) - 25}`}
        />
        <path
          className="sysmap__signal"
          style={{ animationDelay: "600ms" }}
          d={`M ${LANE_X[1]} ${rowY(ROWS.architecture) + 25} L ${LANE_X[1]} ${rowY(ROWS.branches) - 34}`}
        />
        <path
          className="sysmap__signal sysmap__signal--x"
          style={{ animationDelay: "1200ms" }}
          d={`M ${LANE_X[0]} ${rowY(ROWS.branches) - 34} L ${LANE_X[2]} ${rowY(ROWS.branches) - 34}`}
        />
        <path
          className="sysmap__signal sysmap__signal--y"
          style={{ animationDelay: "1800ms" }}
          d={`M ${LANE_X[0]} ${rowY(ROWS.branches) + 25} L ${LANE_X[0]} ${rowY(ROWS.product) - 34}`}
        />
        <path
          className="sysmap__signal sysmap__signal--y"
          style={{ animationDelay: "2400ms" }}
          d={`M ${LANE_X[2]} ${rowY(ROWS.branches) + 25} L ${LANE_X[2]} ${rowY(ROWS.product) - 34}`}
        />
        <path
          className="sysmap__signal"
          style={{ animationDelay: "3000ms" }}
          d={`M ${LANE_X[1]} ${rowY(ROWS.product) + 25} L ${LANE_X[1]} ${rowY(ROWS.user) - 25}`}
        />

        
        <Node stage={stages[0]} x={LANE_X[1]} cy={rowY(ROWS.problem)} terminal {...interactiveProps(stages[0])} />
        <Node stage={stages[1]} x={LANE_X[1]} cy={rowY(ROWS.architecture)} {...interactiveProps(stages[1])} />
        {laneOrder.map((id, lane) => {
          const stage = stageById(id);
          const pillar = heroPillars.find((entry) => entry.id === id);
          return (
            <Node
              key={id}
              stage={stage}
              x={LANE_X[lane]}
              cy={rowY(ROWS.branches)}
              accent={accents[id]}
              sublabel={pillar?.items.slice(0, 3).join(" · ")}
              {...interactiveProps(stage)}
            />
          );
        })}
        <Node stage={stages[5]} x={LANE_X[1]} cy={rowY(ROWS.product)} {...interactiveProps(stages[5])} />
        <Node stage={stages[6]} x={LANE_X[1]} cy={rowY(ROWS.user)} terminal {...interactiveProps(stages[6])} />
      </svg>

      <div className="sysmap__readout">
        <span className="sysmap__readout-label">{detail ? detail.label : "Signal"}</span>
        <p className="sysmap__readout-text">
          {detail
            ? detail.detail
            : "One system, five stages. Each stage does one job, and the next stage depends on it."}
        </p>
      </div>
    </figure>
  );
}

type NodeProps = {
  stage: Stage;
  x: number;
  cy: number;
  terminal?: boolean;
  accent?: Accent;
  sublabel?: string;
} & HTMLAttributes<SVGGElement>;

function Node({ stage, x, cy, terminal = false, accent, sublabel, className = "", ...rest }: NodeProps) {
  const half = terminal ? 86 : 72;
  const classes = [
    "sysmap__node",
    terminal ? "sysmap__node--terminal" : "",
    accent ? `sysmap__node--${accent}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <g
      className={classes}
      data-stage={stage.id}
      transform={`translate(${x} ${cy})`}
      tabIndex={0}
      role="button"
      aria-label={`${stage.label}. ${stage.detail}`}
      {...rest}
    >
      <rect className="sysmap__node-plate" x={-half} y={-25} width={half * 2} height={50} rx={14} />
      <text className="sysmap__node-label" x={0} y={sublabel ? -3 : 5} textAnchor="middle">
        {stage.label}
      </text>
      {sublabel ? (
        <text className="sysmap__node-sub" x={0} y={13} textAnchor="middle">
          {sublabel}
        </text>
      ) : null}
    </g>
  );
}