import Link from "next/link";
import { Container } from "../layout/Container";
import { Reveal } from "../ui/Reveal";
import { TechChip } from "../ui/TechLogo";
import { ProjectDiagram } from "./ProjectDiagram";
import { adjacentProjects } from "../../content/projects";
import type { Project } from "../../content/projects";

const toc = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "context", label: "Context" },
  { id: "requirements", label: "Requirements" },
  { id: "architecture", label: "Architecture" },
  { id: "decisions", label: "Decisions" },
  { id: "implementation", label: "Implementation" },
  { id: "layers", label: "System layers" },
  { id: "validation", label: "Validation" },
  { id: "evaluation", label: "Evaluation" },
  { id: "results", label: "Results" },
  { id: "failures", label: "What did not work" },
];

export function CaseStudyPage({ project }: { project: Project }) {
  const { previous, next } = adjacentProjects(project);
  const layers = [
    { label: "Software", items: project.softwareLayer, accent: "electric" },
    { label: "Data", items: project.dataLayer ?? [], accent: "cyan" },
    { label: "AI", items: project.aiLayer ?? [], accent: "violet" },
  ].filter((layer) => layer.items.length > 0);

  return (
    <article className="case">
      <Container>
        <Link className="back-link" href="/work">
          <span aria-hidden="true">←</span> All work
        </Link>

        <header className="case-hero">
          <div className="case-hero__copy">
            <p className="eyebrow">
              <span className="eyebrow__rule" aria-hidden="true" />
              {project.number} / {project.category} / {project.status} / {project.year}
            </p>
            <h1 className="case-hero__title">{project.title}</h1>
            <p className="case-hero__lede">{project.shortDescription}</p>
            {project.role ? <p className="case-hero__role">{project.role}</p> : null}
            <ul className="case-hero__stack">
              {project.technologies.map((tech) => (
                <li key={tech}>
                  <TechChip name={tech} size={16} />
                </li>
              ))}
            </ul>
          </div>

          <div className="case-hero__visual">
            <ProjectDiagram project={project} />
          </div>
        </header>
      </Container>

      <div className="container case-layout">
        <aside className="case-sidebar">
          <div className="case-sidebar__inner">
            <span className="case-sidebar__label">On this page</span>
            <nav aria-label="Case study sections">
              <ul className="case-toc">
                {toc.map((entry) => (
                  <li key={entry.id}>
                    <a href={`#${entry.id}`}>{entry.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <div className="case-content">
          <CaseSection id="overview" title={project.context.title}>
            <p>{project.context.body}</p>
          </CaseSection>

          <CaseSection id="problem" title={project.problem.title}>
            <p>{project.problem.body}</p>
            {project.problem.items ? <BulletList items={project.problem.items} /> : null}
          </CaseSection>

          <CaseSection id="requirements" title="Requirements">
            <div className="requirements">
              <div>
                <span className="requirements__label">Functional</span>
                <BulletList items={project.requirements.functional} />
              </div>
              <div>
                <span className="requirements__label">Technical</span>
                <BulletList items={project.requirements.technical} />
              </div>
            </div>
            <h3 className="case-subhead">Constraints</h3>
            <ul className="chip-list">
              {project.constraints.map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          </CaseSection>

          <CaseSection id="architecture" title="Architecture">
            <ol className="architecture">
              {project.architecture.map((step) => (
                <li key={step.number} className="architecture__step">
                  <span className="architecture__number">{step.number}</span>
                  <div>
                    <span className="architecture__title">{step.title}</span>
                    <p className="architecture__desc">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CaseSection>

          <CaseSection id="decisions" title="Engineering decisions">
            <div className="decision-table">
              <div className="decision-table__head" aria-hidden="true">
                <span>Decision</span>
                <span>Reason</span>
                <span>Alternative rejected</span>
                <span>Trade-off</span>
              </div>
              {project.engineeringDecisions.map((decision) => (
                <div key={decision.decision} className="decision-row">
                  <span className="decision-row__cell decision-row__cell--decision">{decision.decision}</span>
                  <span className="decision-row__cell">{decision.reason}</span>
                  <span className="decision-row__cell">{decision.alternative}</span>
                  <span className="decision-row__cell">{decision.tradeoff}</span>
                </div>
              ))}
            </div>
          </CaseSection>

          <CaseSection id="implementation" title="Implementation">
            {project.implementation.map((block) => (
              <p key={block.title}>{block.body}</p>
            ))}
          </CaseSection>

          <CaseSection id="layers" title="System layers">
            <div className="layers">
              {layers.map((layer) => (
                <div key={layer.label} className="layers__group" data-accent={layer.accent}>
                  <span className="layers__label">{layer.label}</span>
                  <BulletList items={layer.items} />
                </div>
              ))}
            </div>
          </CaseSection>

          <CaseSection id="validation" title={project.validation.title}>
            <p>{project.validation.body}</p>
          </CaseSection>

          <CaseSection id="evaluation" title={project.evaluation.title}>
            <p>{project.evaluation.body}</p>
          </CaseSection>

          <CaseSection id="results" title={project.results.title}>
            <p>{project.results.body}</p>
          </CaseSection>

          <CaseSection id="failures" title={project.failures.title}>
            <p>{project.failures.body}</p>
            {project.lessons.length > 0 ? (
              <>
                <h3 className="case-subhead">Lessons</h3>
                <BulletList items={project.lessons} />
              </>
            ) : null}
            {project.futureWork.length > 0 ? (
              <>
                <h3 className="case-subhead">Next</h3>
                <BulletList items={project.futureWork} />
              </>
            ) : null}
          </CaseSection>
        </div>
      </div>

      <Container>
        <nav className="project-navigation" aria-label="Project navigation">
          {previous ? (
            <Link className="project-navigation__link project-navigation__link--prev" href={`/work/${previous.slug}`}>
              <span className="project-navigation__label">Previous</span>
              <span className="project-navigation__title">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="project-navigation__link project-navigation__link--next" href={`/work/${next.slug}`}>
              <span className="project-navigation__label">Next</span>
              <span className="project-navigation__title">{next.title}</span>
            </Link>
          ) : null}
        </nav>
      </Container>
    </article>
  );
}

function CaseSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" id={id} className="case-section">
      <h2 className="case-section__title">
        <a href={`#${id}`} className="case-section__anchor">
          {title}
        </a>
      </h2>
      {children}
    </Reveal>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="bullets">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}