import Link from "next/link";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { TechChip } from "../ui/TechLogo";
import { LinkButton } from "../ui/Button";
import { ProjectDiagram } from "../work/ProjectDiagram";
import { featuredProjects } from "../../content/projects";

const statusTone: Record<string, "positive" | "cyan" | "violet" | "orange" | "neutral"> = {
  DEPLOYED: "positive",
  DEMO: "cyan",
  PROTOTYPE: "violet",
  RESEARCH: "orange",
  ARCHIVED: "neutral",
};

export function FeaturedWork() {
  const projects = featuredProjects().slice(0, 3);

  return (
    <Section
      id="selected-work"
      tone="light"
      eyebrow="01 / Selected work"
      heading="Three systems, three different engineering problems."
      lede="Each one is a working system with an architecture, a stack and engineering decisions I can defend. The archive holds the full set."
      aside={
        <LinkButton href="/work" variant="quiet">
          All work
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </LinkButton>
      }
    >
      <div className="featured">
        {projects.map((project, index) => (
          <Reveal key={project.slug} delay={index * 90}>
            <article className={`project project--${project.diagram}`} data-accent={project.accent}>
              <div className="project__copy">
                <div className="project__meta">
                  <span className="project__number">{project.number}</span>
                  <span className="project__category">{project.category}</span>
                  <span className={`project__status project__status--${statusTone[project.status] ?? "neutral"}`}>
                    <span className="project__status-dot" aria-hidden="true" />
                    {project.status}
                  </span>
                  <span className="project__year">{project.year}</span>
                </div>

                <h3 className="project__title">{project.title}</h3>
                <p className="project__role">{project.role}</p>
                <p className="project__desc">{project.shortDescription}</p>

                <ul className="project__stack">
                  {project.technologies.map((tech) => (
                    <li key={tech}>
                      <TechChip name={tech} size={14} />
                    </li>
                  ))}
                </ul>

                <Link className="project__cta" href={`/work/${project.slug}`}>
                  Read the case study
                  <span className="project__cta-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>

              <div className="project__visual">
                <div className="project__visual-frame">
                  <span className="project__visual-label">
                    {project.accent === "electric" ? "Pipeline" : project.accent === "violet" ? "Platform flow" : "Edge pipeline"}
                  </span>
                  <ProjectDiagram project={project} />
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="featured__footer">
        <p className="featured__count">
          <span>{projects.length}</span> of the archive, curated for the homepage.
        </p>
        <LinkButton href="/work">
          Explore all work
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </LinkButton>
      </div>
    </Section>
  );
}