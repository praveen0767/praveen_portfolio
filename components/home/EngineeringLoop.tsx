"use client";

import { useState } from "react";
import { processStages } from "../../content/home";

export function EngineeringLoop() {
  const [active, setActive] = useState(processStages[0].number);
  const stage = processStages.find((entry) => entry.number === active) ?? processStages[0];

  return (
    <div className="loop">
      <ol className="loop__nodes">
        {processStages.map((entry) => (
          <li key={entry.number}>
            <button
              type="button"
              className="loop__node"
              data-active={entry.number === active ? "true" : undefined}
              aria-pressed={entry.number === active}
              onMouseEnter={() => setActive(entry.number)}
              onFocus={() => setActive(entry.number)}
              onClick={() => setActive(entry.number)}
            >
              <span className="loop__dot" aria-hidden="true" />
              <span className="loop__number">{entry.number}</span>
              <span className="loop__label">{entry.label}</span>
            </button>
          </li>
        ))}
        <span className="loop__rail" aria-hidden="true">
          <span className="loop__rail-signal" />
        </span>
      </ol>

      <p className="loop__readout">
        <span className="loop__readout-index">{stage.number}</span>
        {stage.description}
      </p>
    </div>
  );
}