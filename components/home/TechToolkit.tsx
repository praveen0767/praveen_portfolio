"use client";

import { useState } from "react";
import { activeTechCategories, technologies } from "../../content/tech";
import type { Tech, TechCategory } from "../../content/tech";
import { projectsUsing } from "../../content/tech";
import { TechLogo } from "../ui/TechLogo";

export function TechToolkit() {
  const categories = activeTechCategories();
  const [filter, setFilter] = useState<TechCategory>("ALL");
  const [selected, setSelected] = useState<Tech | null>(null);

  const visible = filter === "ALL" ? technologies : technologies.filter((tech) => tech.category === filter);

  return (
    <div className="toolkit">
      <div className="toolkit__controls">
        <div className="toolkit__filters" role="group" aria-label="Filter technologies by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className="toolkit__filter"
              data-active={category === filter ? "true" : undefined}
              aria-pressed={category === filter}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <p className="toolkit__count">
          <span>{visible.length}</span> / {technologies.length} technologies
        </p>
      </div>

      <ul className="toolkit__grid">
        {visible.map((tech) => (
          <li key={tech.id}>
            <button
              type="button"
              className="tech-tile"
              style={{ "--brand": tech.accent ?? tech.hex ?? "#5b6b8c" } as React.CSSProperties}
              data-active={selected?.id === tech.id ? "true" : undefined}
              aria-pressed={selected?.id === tech.id}
              onMouseEnter={() => setSelected(tech)}
              onFocus={() => setSelected(tech)}
              onClick={() => setSelected((current) => (current?.id === tech.id ? null : tech))}
            >
              <span className="tech-tile__mark">
                <TechLogo name={tech.name} size={26} />
              </span>
              <span className="tech-tile__name">{tech.name}</span>
              <span className="tech-tile__category">{tech.category}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="toolkit__readout">
        {selected ? (
          <>
            <span className="toolkit__readout-name">{selected.name}</span>
            <span className="toolkit__readout-role">{selected.role}</span>
            <span className="toolkit__readout-context">
              {projectsUsing(selected).length > 0
                ? `Used in ${projectsUsing(selected)
                    .map((project) => project.title)
                    .join(", ")}.`
                : "Used across the engineering work described in the case studies."}
            </span>
          </>
        ) : (
          <span className="toolkit__readout-hint">
            Select a technology to see how it is used and where it shows up.
          </span>
        )}
      </div>

      <StackVisual />
    </div>
  );
}

/** SOFTWARE + DATA + AI → SYSTEMS → PRODUCT */
function StackVisual() {
  const pillars = [
    { label: "Software", detail: "Services, APIs, interfaces", accent: "electric" },
    { label: "Data", detail: "Storage, retrieval, pipelines", accent: "cyan" },
    { label: "AI", detail: "Models, agents, evaluation", accent: "violet" },
  ];
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="stackmap" aria-label="Software, data and AI combine into systems and ship as a product">
      <div className="stackmap__inputs">
        {pillars.map((pillar) => (
          <button
            key={pillar.label}
            type="button"
            className="stackmap__input"
            data-accent={pillar.accent}
            data-active={active === pillar.label ? "true" : undefined}
            aria-pressed={active === pillar.label}
            onMouseEnter={() => setActive(pillar.label)}
            onFocus={() => setActive(pillar.label)}
            onMouseLeave={() => setActive(null)}
            onBlur={() => setActive(null)}
          >
            <span className="stackmap__input-label">{pillar.label}</span>
            <span className="stackmap__input-detail">{pillar.detail}</span>
          </button>
        ))}
      </div>

      <div className="stackmap__rail" aria-hidden="true">
        <span className="stackmap__signal" />
      </div>

      <div className="stackmap__outputs">
        <div className="stackmap__output stackmap__output--systems">
          <span className="stackmap__output-label">Systems</span>
          <span className="stackmap__output-detail">Reliable, observable, evaluated</span>
        </div>
        <span className="stackmap__arrow" aria-hidden="true">
          →
        </span>
        <div className="stackmap__output stackmap__output--product">
          <span className="stackmap__output-label">Product</span>
          <span className="stackmap__output-detail">Something a person can use</span>
        </div>
      </div>
    </div>
  );
}