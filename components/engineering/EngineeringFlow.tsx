"use client";

import { useState } from "react";
import { engineeringLoop } from "../../content/engineering";

/**
 * The engineering loop, rendered as an interactive rail.
 *
 * Hover, focus or click a stage to read it. Everything is a real button so the
 * interaction works with a keyboard and on touch, and the rail keeps a visible
 * progress signal so the loop reads as a cycle rather than a list.
 */
export function EngineeringFlow() {
  const [active, setActive] = useState(engineeringLoop[0].number);
  const stage = engineeringLoop.find((entry) => entry.number === active) ?? engineeringLoop[0];

  return (
    <div className="flow" data-active={stage.number}>
      <ol className="flow__nodes">
        {engineeringLoop.map((entry) => (
          <li key={entry.number}>
            <button
              type="button"
              className="flow__node"
              data-active={entry.number === stage.number ? "true" : undefined}
              aria-pressed={entry.number === stage.number}
              onMouseEnter={() => setActive(entry.number)}
              onFocus={() => setActive(entry.number)}
              onClick={() => setActive(entry.number)}
            >
              <span className="flow__node-dot" aria-hidden="true" />
              <span className="flow__node-number">{entry.number}</span>
              <span className="flow__node-label">{entry.title}</span>
            </button>
          </li>
        ))}
        <span className="flow__rail" aria-hidden="true">
          <span
            className="flow__rail-signal"
            style={{ "--progress": engineeringLoop.findIndex((entry) => entry.number === stage.number) } as React.CSSProperties}
          />
        </span>
      </ol>

      <div className="flow__readout" role="status" aria-live="polite">
        <span className="flow__readout-index">{stage.number}</span>
        <div>
          <p className="flow__readout-title">{stage.title}</p>
          <p className="flow__readout-body">{stage.body}</p>
        </div>
      </div>
    </div>
  );
}