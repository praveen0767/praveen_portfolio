"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { arivStages } from "../../../content/ariv";
import type { ArivNodeKind } from "../../../content/ariv";
import { prefersReducedMotion } from "../../../lib/motion-env";

/* Canvas geometry. Fixed here rather than in CSS so the wires and the node plates
   can never drift apart — every coordinate is derived from these five numbers. */
const VIEW_W = 960;
const VIEW_H = 712;
const BAND_H = 88;
const BAND_TOP = 24;
const NODE_W = 160;
const NODE_H = 42;
const NODE_GAP = 19;
const RAIL_X = 64;
const CENTER_X = 504;

type Placed = {
  id: string;
  label: string;
  full: string;
  /** Drives the node colour: which layer is allowed to decide what. */
  kind: ArivNodeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
};

type Wire = { id: string; d: string; from: string; to: string };

/** Keys that mean "the reader is navigating", so a pinned stage releases. */
const NAVIGATION_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

type Band = {
  stageIndex: string;
  nodes: Placed[];
  sidecar?: Placed;
  wires: Wire[];
  /** The wire that carries the band forward to the next band. */
  exit?: Wire;
  labelY: number;
};

const bandTop = (index: number) => BAND_TOP + index * BAND_H;
const nodeWidth = (count: number) => count * NODE_W + Math.max(0, count - 1) * NODE_GAP;
const nodeStart = (count: number) => CENTER_X - nodeWidth(count) / 2;

/** A soft S-curve between two points, used for every hand-off. */
function curve(x1: number, y1: number, x2: number, y2: number) {
  return `M ${x1} ${y1} C ${x1} ${y1 + 22}, ${x2} ${y2 - 22}, ${x2} ${y2}`;
}

/**
 * Lays every stage out once, at module scope, so the render is pure.
 *
 * A forked stage (PolicyEngine approving or rejecting) puts its two approved
 * nodes on the upper rail and the stop node on a lower rail, so the branch reads
 * as a branch rather than as a continuation of the pipeline.
 */
const BANDS: Band[] = arivStages.map((stage, index) => {
  const top = bandTop(index);

  if (stage.sidecar) {
    const main = stage.nodes;
    const start = nodeStart(main.length + 1);
    const upperY = top - 13;

    const nodes: Placed[] = main.map((node, position) => {
      const x = start + position * (NODE_W + NODE_GAP);
      return { ...node, x, y: upperY, w: NODE_W, h: NODE_H, cx: x + NODE_W / 2, cy: upperY + NODE_H / 2 };
    });

    const sidecarX = start + main.length * (NODE_W + NODE_GAP);
    const sidecarY = upperY + NODE_H + 4;

    return {
      stageIndex: stage.index,
      nodes,
      sidecar: {
        id: stage.sidecar.id,
        label: stage.sidecar.label,
        full: stage.sidecar.full,
        kind: stage.sidecar.kind,
        x: sidecarX,
        y: sidecarY,
        w: NODE_W,
        h: 34,
        cx: sidecarX + NODE_W / 2,
        cy: sidecarY + 17,
      },
      wires: [
        ...nodes.slice(1).map((node, position) => {
          const previous = nodes[position];
          return {
            id: `${stage.index}-w${position}`,
            d: `M ${previous.x + NODE_W} ${previous.cy} L ${node.x} ${node.cy}`,
            from: previous.id,
            to: node.id,
          };
        }),
        {
          id: `${stage.index}-stop`,
          d: `M ${nodes[0].x + NODE_W} ${nodes[0].cy} C ${nodes[0].x + NODE_W + 76} ${nodes[0].cy}, ${sidecarX - 84} ${sidecarY + 17}, ${sidecarX} ${sidecarY + 17}`,
          from: stage.sidecar.from,
          to: stage.sidecar.id,
        },
      ],
      labelY: top + NODE_H / 2,
    };
  }

  const start = nodeStart(stage.nodes.length);
  const nodes: Placed[] = stage.nodes.map((node, position) => {
    const x = start + position * (NODE_W + NODE_GAP);
    return { ...node, x, y: top, w: NODE_W, h: NODE_H, cx: x + NODE_W / 2, cy: top + NODE_H / 2 };
  });

  return {
    stageIndex: stage.index,
    nodes,
    wires: nodes.slice(1).map((node, position) => {
      const previous = nodes[position];
      return {
        id: `${stage.index}-w${position}`,
        d: `M ${previous.x + NODE_W} ${previous.cy} L ${node.x} ${node.cy}`,
        from: previous.id,
        to: node.id,
      };
    }),
    labelY: top + NODE_H / 2,
  };
});

/** The forward hand-off wires, drawn once the bands above them exist. */
const EXITS: Record<string, Wire> = {};
BANDS.forEach((band, index) => {
  const next = BANDS[index + 1];
  if (!next) return;
  const from = band.nodes[band.nodes.length - 1];
  const to = next.nodes[0];
  EXITS[band.stageIndex] = {
    id: `${band.stageIndex}-exit`,
    d: curve(from.cx, from.y + from.h, to.cx, to.y),
    from: from.id,
    to: to.id,
  };
});

const LAST_TOP = bandTop(BANDS.length - 1);
const RAIL_BOTTOM = LAST_TOP + NODE_H;

const STATE = ["idle", "done", "active"] as const;

/**
 * The ARIV control plane, drawn as a running system rather than a static chart.
 *
 * Scroll position picks which stage is live; the live stage's wires carry a
 * travelling pulse and its nodes light up, while stages already passed stay
 * faintly lit so the reader can see how far the control plane has come.
 *
 * The scroll work is one passive listener, one `requestAnimationFrame` per frame
 * at most, and it only runs while the canvas is on screen. Under
 * `prefers-reduced-motion` it never attaches at all — every stage renders in its
 * passed state instead, which is also the keyboard end state.
 */
export function ArivSystem() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // Scroll position is the source of truth while the reader is scrolling, but a
  // deliberate click or keyboard move should not be undone by the next scroll
  // event. A ref keeps the flag out of the render path.
  const pinnedRef = useRef(false);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    if (prefersReducedMotion()) return;
    if (typeof IntersectionObserver === "undefined") return;

    let onScreen = false;
    let ticking = false;
    let frame = 0;

    const apply = () => {
      ticking = false;
      if (pinnedRef.current) return;
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const span = rect.height + viewport;
      const travelled = viewport - rect.top;
      const progress = Math.min(1, Math.max(0, travelled / span));
      const next = Math.min(arivStages.length - 1, Math.floor(progress * arivStages.length));
      setActive((current) => (current === next ? current : next));
    };

    const schedule = () => {
      if (ticking || !onScreen) return;
      ticking = true;
      frame = requestAnimationFrame(apply);
    };

    // Any real navigation gesture hands control back to scroll position.
    const release = () => {
      pinnedRef.current = false;
      schedule();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (NAVIGATION_KEYS.has(event.key)) release();
    };

    apply();

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        // Leaving the section always drops the pin, so coming back starts from
        // wherever the reader has scrolled to.
        if (!onScreen) pinnedRef.current = false;
        if (onScreen) schedule();
      },
      { rootMargin: "25% 0px" },
    );
    observer.observe(node);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("touchmove", release);
      window.removeEventListener("keydown", onKeyDown);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /** Hover previews a stage, but never overrules a stage the reader committed to. */
  const preview = useCallback((index: number) => {
    if (pinnedRef.current) return;
    setActive(index);
  }, []);
  const select = useCallback((index: number) => {
    pinnedRef.current = true;
    setActive(index);
  }, []);
  const stage = arivStages[active];

  return (
    <div className="arivsys" ref={trackRef}>
      {/* ── Stage rail ─────────────────────────────────────────────── */}
      <ol className="arivsys__rail" aria-label="ARIV control-plane stages">
        {arivStages.map((entry, index) => (
          <li key={entry.index} className="arivsys__rail-item">
            <button
              type="button"
              className="arivsys__step"
              data-active={index === active ? "true" : undefined}
              aria-pressed={index === active}
              aria-describedby={`ariv-stage-${entry.index}`}
              onClick={() => select(index)}
              onFocus={() => select(index)}
              onMouseEnter={() => preview(index)}
            >
              <span className="arivsys__step-index" aria-hidden="true">
                {entry.index}
              </span>
              <span className="arivsys__step-title">{entry.title}</span>
            </button>
            {index < arivStages.length - 1 ? (
              <span className="arivsys__flow-arrow" aria-hidden="true">
                ↓
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {/* ── Live band ─────────────────────────────────────────────── */}
      {/* The selected stage's copy, full width. It sits outside the chip grid
          on purpose: inside a chip a 60-word paragraph becomes a tower of
          wrapped text falling over the canvas — the one thing the flagship
          must never look like. */}
      <div className="arivsys__details">
        {arivStages.map((entry, index) => (
          <div
            key={entry.index}
            className="arivsys__detail"
            id={`ariv-stage-${entry.index}`}
            data-active={index === active ? "true" : undefined}
          >
            <p className="arivsys__detail-head">
              <span aria-hidden="true">{entry.index}</span>
              {entry.label}
            </p>
            <p className="arivsys__detail-text">{entry.body}</p>
            <p className="arivsys__detail-handoff">
              <span aria-hidden="true">→</span> {entry.handsOff}
            </p>
          </div>
        ))}
      </div>

      {/* ── Canvas ─────────────────────────────────────────────────── */}
      <div className="arivsys__canvas" data-stage={stage.index}>
        <div className="arivsys__scan" aria-hidden="true" />

        <svg
          className="arivsys__svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label={`ARIV control plane, ${arivStages.length} stages: ${arivStages.map((entry) => entry.title).join(", ")}.`}
        >
          <defs>
            <linearGradient id="ariv-rail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ariv-cyan)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--ariv-violet)" stopOpacity="0.14" />
            </linearGradient>
            <linearGradient id="ariv-flow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--ariv-electric)" />
              <stop offset="55%" stopColor="var(--ariv-violet)" />
              <stop offset="100%" stopColor="var(--ariv-cyan)" />
            </linearGradient>
          </defs>

          {/* Stage rail spine */}
          <line className="arivsys__spine" x1={RAIL_X} y1={BAND_TOP} x2={RAIL_X} y2={RAIL_BOTTOM} />
          <line
            className="arivsys__spine-fill"
            x1={RAIL_X}
            y1={BAND_TOP}
            x2={RAIL_X}
            y2={RAIL_BOTTOM}
            style={{ stroke: "url(#ariv-rail)" }}
          />

          {BANDS.map((band, bandIndex) => {
            const state = STATE[bandIndex === active ? 2 : bandIndex < active ? 1 : 0];
            const exit = EXITS[band.stageIndex];
            const sidecarWire = band.wires.find((wire) => band.sidecar && wire.to === band.sidecar.id);

            return (
              <g key={band.stageIndex} className="arivsys__band" data-state={state}>
                <text className="arivsys__band-index" x={RAIL_X - 16} y={band.labelY + 4} textAnchor="end">
                  {band.stageIndex}
                </text>
                <circle className="arivsys__band-tick" cx={RAIL_X} cy={band.labelY} r={bandIndex === active ? 4 : 2.5} />

                {/* forward hand-off out of this band */}
                {exit ? (
                  <g data-wire={state === "active" ? "active" : state === "done" ? "done" : "idle"}>
                    <path className="arivsys__wire arivsys__wire--exit" d={exit.d} />
                    <path className="arivsys__wire arivsys__wire--exit arivsys__wire--pulse" d={exit.d} />
                  </g>
                ) : null}

                {band.wires.map((wire) => {
                  const isStop = Boolean(sidecarWire && wire.id === sidecarWire.id);
                  return (
                    <g
                      key={wire.id}
                      data-wire={state === "active" ? "active" : state === "done" ? "done" : "idle"}
                      data-kind={isStop ? "stop" : "flow"}
                    >
                      <path className={`arivsys__wire${isStop ? " arivsys__wire--stop" : ""}`} d={wire.d} />
                      {!isStop ? <path className="arivsys__wire arivsys__wire--pulse" d={wire.d} /> : null}
                    </g>
                  );
                })}

                {band.nodes.map((node) => (
                  <g key={node.id} className="arivsys__node" data-kind={node.kind} data-state={state}>
                    <rect className="arivsys__plate" x={node.x} y={node.y} width={node.w} height={node.h} rx={11} />
                    <rect
                      className="arivsys__plate-glow"
                      x={node.x}
                      y={node.y}
                      width={node.w}
                      height={node.h}
                      rx={11}
                    />
                    <text className="arivsys__node-label" x={node.cx} y={node.cy + 4} textAnchor="middle">
                      {node.label}
                    </text>
                    <rect
                      className="arivsys__node-led"
                      x={node.x + 12}
                      y={node.cy - 2.5}
                      width={5}
                      height={5}
                      rx={2.5}
                    />
                  </g>
                ))}

                {band.sidecar ? (
                  <g className="arivsys__node" data-kind="stop" data-state={state}>
                    <rect
                      className="arivsys__plate arivsys__plate--stop"
                      x={band.sidecar.x}
                      y={band.sidecar.y}
                      width={band.sidecar.w}
                      height={band.sidecar.h}
                      rx={9}
                    />
                    <text
                      className="arivsys__node-label arivsys__node-label--stop"
                      x={band.sidecar.cx}
                      y={band.sidecar.cy + 3.5}
                      textAnchor="middle"
                    >
                      {band.sidecar.label}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>

        <p className="arivsys__legend">
          <span className="arivsys__legend-item" data-kind="reason">
            Agentic — proposes
          </span>
          <span className="arivsys__legend-item" data-kind="gate">
            Deterministic — authorizes
          </span>
          <span className="arivsys__legend-item" data-kind="durable">
            Durable — executes
          </span>
          <span className="arivsys__legend-item" data-kind="provider">
            Provider — confirms
          </span>
        </p>
      </div>
    </div>
  );
}
