"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { TechLogo, techBrand } from "../ui/TechLogo";
import { getProject, orderedProjects } from "../../content/projects";
import { techGroups, technologies, technologiesInGroup } from "../../content/tech";
import type { Tech, TechGroupId } from "../../content/tech";

type Tab = { id: TechGroupId; label: string; count: number };

/**
 * "Tech I actually use" playground.
 *
 * Switching a group rearranges the brand field with a staggered entrance, and
 * selecting a technology reveals where it is used in the verified project stacks —
 * contextual intelligence instead of a wall of skill text.
 */
export function TechPlayground() {
  const [group, setGroup] = useState<TechGroupId>("ALL");
  const [selected, setSelected] = useState<Tech | null>(null);

  const tabs: Tab[] = [
    { id: "ALL", label: "Everything", count: technologies.length },
    ...techGroups.map((entry) => ({
      id: entry.id as TechGroupId,
      label: entry.label,
      count: technologiesInGroup(entry.id).length,
    })),
  ];

  const visible = technologiesInGroup(group);
  const usedIn = selected ? orderedProjects().filter((project) => project.technologies.includes(selected.name)) : [];

  return (
    <div className="playground">
      <div className="playground__panel">
        <div className="playground__tabs" role="group" aria-label="Filter technologies by group">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="playground__tab"
              data-active={group === tab.id ? "true" : undefined}
              aria-pressed={group === tab.id}
              onClick={() => {
                setGroup(tab.id);
                setSelected(null);
              }}
            >
              {tab.label}
              <span className="playground__tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        <ul className="playground__field">
          {visible.map((tech) => (
            <m.li key={tech.id} layout transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}>
              <button
                type="button"
                className="tech-tile"
                style={{ "--brand": tech.accent ?? tech.hex ?? "#6f8bff" } as React.CSSProperties}
                data-active={selected?.id === tech.id ? "true" : undefined}
                aria-pressed={selected?.id === tech.id}
                onMouseEnter={() => setSelected(tech)}
                onFocus={() => setSelected(tech)}
                onClick={() => setSelected((current) => (current?.id === tech.id ? null : tech))}
              >
                <span className="tech-tile__mark">
                  <TechLogo name={tech.name} size={28} />
                </span>
                <span className="tech-tile__name">{tech.name}</span>
              </button>
            </m.li>
          ))}
        </ul>
      </div>

      <aside className="readout" style={{ "--brand": techBrand(selected ?? undefined) } as React.CSSProperties} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={selected?.id ?? "empty"}
            className="readout__body"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {selected ? (
              <>
                <div className="readout__head">
                  <span className="readout__mark">
                    <TechLogo name={selected.name} size={24} />
                  </span>
                  <div>
                    <p className="readout__name">{selected.name}</p>
                    <p className="readout__category">{selected.category}</p>
                  </div>
                </div>

                <p className="readout__role">{selected.role}</p>

                <span className="readout__divider" aria-hidden="true" />

                <p className="readout__usage-label">Used in</p>
                {usedIn.length > 0 ? (
                  <div className="readout__usage">
                    {usedIn.map((project) => (
                      <Link key={project.slug} href={`/work/${project.slug}`}>
                        <span aria-hidden="true">→</span>
                        {getProject(project.slug)?.title ?? project.title}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="readout__usage-empty">
                    Not in a project stack on this site — used across the engineering work described in the case
                    studies.
                  </p>
                )}
              </>
            ) : (
              <p className="readout__hint">
                Hover or focus a technology to see what it does and which verified systems it appears in.
              </p>
            )}
          </m.div>
        </AnimatePresence>
      </aside>
    </div>
  );
}