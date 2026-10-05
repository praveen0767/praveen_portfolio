import Link from "next/link";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { TechChip } from "../ui/TechLogo";
import { LinkButton } from "../ui/Button";
import { Magnetic } from "../motion/Magnetic";
import { ProjectMark } from "../ui/ProjectMark";
import { ProjectGlyph } from "../work/ProjectGlyph";
import { featuredProjects } from "../../content/projects";
import type { Project } from "../../content/projects";

/** ARIV is project 01 and gets the flagship stage; everything after it lands here. */
const FLAGSHIP_SLUG = "ariv-agentic-revenue-recovery";

/**
 * The rest of the work.
 *
 * Three projects, one row each, each with its own abstract technical graphic and
 * a lighter 3D treatment than ARIV — the flagship is allowed to be loud because
 * there is only one of it. Stacked rows rather than cards, because three equal
 * cards would say "these are the same kind of thing" and they are not.
 */
export function FeaturedWork() {
  const others = featuredProjects().filter((project) => project.slug !== FLAGSHIP_SLUG);

  return (
    <Section
      id="selected-work"
      className="others"
      eyebrow={`Selected work \u00b7 ${others.map((project) => project.number).join(" / ")}`}
      heading="What else I built."
      lede="Three more systems, each solving a different engineering problem. Same standard: the architecture, the stack and the decisions written down where they can be argued with."
      aside={
        <LinkButton href="/work" variant="quiet">
          Work archive
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </LinkButton>
      }
    >
      <div className="others__list">
        {others.map((project, index) => (
          <Reveal key={project.slug} delay={index * 80}>
            <article className="others__row" data-accent={project.accent}>
              <div className="others__copy">
                <ProjectMeta project={project} />
                <h3 className="others__title">
                  <ProjectMark slug={project.slug} title={project.title} size={32} />
                  <Link href={`/work/${project.slug}`}>{project.title}</Link>
                </h3>
                {project.role ? <p className="project__role">{project.role}</p> : null}
                <p className="others__desc">{project.shortDescription}</p>
                <ul className="project__stack">
                  {project.technologies.map((tech) => (
                    <li key={tech}>
                      <TechChip name={tech} size={14} />
                    </li>
                  ))}
                </ul>
                <Link className="project__cta" href={`/work/${project.slug}`}>
                  View case study
                  <span className="project__cta-arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </div>

              <div className="others__visual">
                <ProjectGlyph project={project} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="featured__foot">
        <p className="featured__foot-note">
          <strong>{others.length + 1}</strong> verified systems. ARIV leads because it is the one where the
          architecture, the policy boundary and the measurement all had to be defensible at once.
        </p>
        <Magnetic>
          <LinkButton href="/work">
            Open the work archive
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </LinkButton>
        </Magnetic>
      </div>
    </Section>
  );
}

function ProjectMeta({ project }: { project: Project }) {
  return (
    <p className="project-meta">
      <span className="project-meta__number">{project.number}</span>
      <span>{project.category}</span>
      <span className="project-status">
        <span className="project-status__dot" aria-hidden="true" />
        {project.status}
      </span>
      <span>{project.year}</span>
    </p>
  );
}
