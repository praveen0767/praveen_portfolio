"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { TechChip } from "../ui/TechLogo";
import { ProjectDiagram } from "./ProjectDiagram";
import { activeProjectCategories, orderedProjects } from "../../content/projects";
import type { Project } from "../../content/projects";

const statusTone: Record<string, string> = {
  DEPLOYED: "positive",
  DEMO: "cyan",
  PROTOTYPE: "violet",
  RESEARCH: "orange",
  ARCHIVED: "neutral",
};

export function WorkIndex() {
  const projects = orderedProjects();
  const categories = activeProjectCategories();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (category && project.category !== category) return false;
      if (!needle) return true;
      return [project.title, project.shortDescription, project.category, ...project.technologies]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [projects, query, category]);

  return (
    <Section
      tone="light"
      eyebrow="Work / Archive"
      heading="The full archive of shipped systems."
      lede="Three verified projects, each with the architecture, decisions and failure modes behind it."
      aside={
        <p className="project-count">
          <span>{visible.length}</span> / {projects.length}
        </p>
      }
    >
      <div className="archive-controls">
        {categories.length > 1 ? (
          <div className="archive-controls__group" role="group" aria-label="Filter by category">
            <button
              type="button"
              className="archive-filter"
              data-active={category === null ? "true" : undefined}
              aria-pressed={category === null}
              onClick={() => setCategory(null)}
            >
              All
            </button>
            {categories.map((entry) => (
              <button
                key={entry}
                type="button"
                className="archive-filter"
                data-active={category === entry ? "true" : undefined}
                aria-pressed={category === entry}
                onClick={() => setCategory(category === entry ? null : entry)}
              >
                {entry}
              </button>
            ))}
          </div>
        ) : null}

        <label className="archive-search">
          <span className="visually-hidden">Search projects</span>
          <span className="archive-search__icon" aria-hidden="true">
            /
          </span>
          <input
            type="search"
            value={query}
            placeholder="Search title, stack, category"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="empty-state">
          No project matches that. <button type="button" onClick={() => { setQuery(""); setCategory(null); }}>Reset filters</button>
        </p>
      ) : (
        <ul className="archive">
          {visible.map((project, index) => (
            <Reveal key={project.slug} delay={index * 60}>
              <li>
                <ArchiveRow project={project} />
              </li>
            </Reveal>
          ))}
        </ul>
      )}
    </Section>
  );
}

function ArchiveRow({ project }: { project: Project }) {
  return (
    <article className="archive-row" data-accent={project.accent}>
      <div className="archive-row__visual" aria-hidden="true">
        <ProjectDiagram project={project} compact />
      </div>

      <div className="archive-row__main">
        <div className="archive-row__meta">
          <span className="archive-row__number">{project.number}</span>
          <span className="archive-row__category">{project.category}</span>
          <span className={`archive-row__status archive-row__status--${statusTone[project.status] ?? "neutral"}`}>
            {project.status}
          </span>
          <span className="archive-row__year">{project.year}</span>
        </div>

        <h2 className="archive-row__title">
          <Link href={`/work/${project.slug}`}>{project.title}</Link>
        </h2>
        <p className="archive-row__desc">{project.shortDescription}</p>

        <ul className="archive-row__stack">
          {project.technologies.map((tech) => (
            <li key={tech}>
              <TechChip name={tech} size={14} />
            </li>
          ))}
        </ul>
      </div>

      <Link className="archive-row__cta" href={`/work/${project.slug}`}>
        Case study
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}