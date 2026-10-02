import Link from "next/link";
import { Container } from "../layout/Container";
import { TechChip } from "../ui/TechLogo";
import type { Experiment, LabNote } from "../../content/lab/types";
import { getProject } from "../../content/projects";

export function NoteDetailPage({ note }: { note: LabNote }) {
  const related = (note.relatedProjects ?? [])
    .map((slug) => getProject(slug))
    .filter((project): project is NonNullable<typeof project> => Boolean(project));

  return (
    <article className="detail">
      <Container>
        <Link className="back-link" href="/lab/notes">
          <span aria-hidden="true">←</span> Notes
        </Link>

        <header className="detail__header">
          <p className="eyebrow">
            <span className="eyebrow__rule" aria-hidden="true" />
            {note.category} / {note.date}
          </p>
          <h1 className="detail__title">{note.title}</h1>
          <p className="detail__lede">{note.description}</p>
          <div className="detail__meta">
            <ul className="chip-list">
              {note.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <span className="detail__reading">{note.readingTime}</span>
          </div>
        </header>

        <div className="detail__body">
          {note.content.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>
          ))}
        </div>

        {related.length > 0 ? (
          <section className="detail__related">
            <span className="detail__related-label">Related work</span>
            <ul>
              {related.map((project) => (
                <li key={project.slug}>
                  <Link href={`/work/${project.slug}`}>
                    {project.title} <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </article>
  );
}

export function ExperimentDetailPage({ experiment }: { experiment: Experiment }) {
  const stages: [string, string][] = [
    ["Question", experiment.question],
    ["Hypothesis", experiment.hypothesis],
    ["Method", experiment.method],
    ["Result", experiment.result],
    ["Learning", experiment.learning],
    ["Next", experiment.nextStep],
  ];
  const project = experiment.relatedProject ? getProject(experiment.relatedProject) : undefined;

  return (
    <article className="detail">
      <Container>
        <Link className="back-link" href="/lab/experiments">
          <span aria-hidden="true">←</span> Experiments
        </Link>

        <header className="detail__header">
          <p className="eyebrow">
            <span className="eyebrow__rule" aria-hidden="true" />
            Experiment / {experiment.date}
          </p>
          <h1 className="detail__title">{experiment.title}</h1>
          <p className="detail__status">{experiment.status}</p>
          <ul className="chip-list">
            {experiment.technologies.map((technology) => (
              <li key={technology}>
                <TechChip name={technology} size={14} />
              </li>
            ))}
          </ul>
        </header>

        <ol className="experiment">
          {stages.map(([label, value], index) => (
            <li key={label} className="experiment__stage">
              <span className="experiment__label">
                {String(index + 1).padStart(2, "0")} / {label}
              </span>
              <p className="experiment__value">{value}</p>
            </li>
          ))}
        </ol>

        {experiment.content.length > 0 ? (
          <div className="detail__body">
            {experiment.content.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 12)}`}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {project ? (
          <section className="detail__related">
            <span className="detail__related-label">Related work</span>
            <ul>
              <li>
                <Link href={`/work/${project.slug}`}>
                  {project.title} <span aria-hidden="true">→</span>
                </Link>
              </li>
            </ul>
          </section>
        ) : null}
      </Container>
    </article>
  );
}