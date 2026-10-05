import Link from "next/link";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { JourneyMark } from "./JourneyMark";
import { ProjectMark } from "../ui/ProjectMark";
import { careerEvents } from "../../content/career";
import type { CareerEvent, CareerEventType } from "../../content/career";
import { getProject } from "../../content/projects";
import { profile } from "../../content/profile";

const accentByType: Record<CareerEventType, string> = {
  EDUCATION: "cyan",
  EXPERIENCE: "lime",
  PROJECT: "electric",
  MILESTONE: "orange",
};

const tagByType: Record<CareerEventType, string> = {
  EDUCATION: "Study",
  EXPERIENCE: "Work",
  PROJECT: "Built",
  MILESTONE: "Milestone",
};

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/**
 * Numeric chronology key built only from the year plus whatever month the record
 * actually states. Nothing is invented: an entry with no month sorts to January
 * of its own year rather than being given a fabricated day.
 */
function chronology(event: CareerEvent): number {
  const year = Number.parseInt(event.year, 10) || 0;
  const stated = (event.date ?? "").toLowerCase();
  const month = MONTHS.findIndex((name) => stated.includes(name));
  return year * 100 + month + 1;
}

/**
 * The journey, rendered as a timeline rather than a stacked CV list.
 * Every project row links to the system it produced, so the timeline is also a
 * navigation device rather than a restatement of the resume.
 *
 * The rows share one decorative spine: each row draws the stretch of line above
 * and below its own node, and the two stretches meet at the row borders, so the
 * line runs unbroken from the newest node to the oldest without a single
 * wrapper-level absolute element. Date, node and body stay in the row grid.
 */
export function JourneyTimeline() {
  /* Newest first, ordered by real chronology inside each year so the latest
     build sits at the head of the spine. */
  const events = [...careerEvents].sort((a, b) => chronology(b) - chronology(a));

  return (
    <Section
      id="journey"
      eyebrow="Journey"
      heading="From classroom to systems I can defend."
      lede={`${profile.educationPeriod} of ${profile.education} at ${profile.institution}, plus an internship and four systems taken end to end. No filler entries.`}
      aside={
        <p className="journey__aside">
          <span>{events.length}</span> recorded steps
        </p>
      }
    >
      <ol className="journey">
        {events.map((event, index) => (
          <Reveal
            key={event.id}
            as="li"
            className="journey__row"
            delay={index * 70}
          >
            <JourneyRow event={event} latest={index === 0} />
          </Reveal>
        ))}
      </ol>

      <dl className="journey__facts">
        <div>
          <dt>Degree</dt>
          <dd>{profile.education}</dd>
        </div>
        <div>
          <dt>Institute</dt>
          <dd>{profile.institution}</dd>
        </div>
        <div>
          <dt>Period</dt>
          <dd>{profile.educationPeriod}</dd>
        </div>
        <div>
          <dt>CGPA</dt>
          <dd>{profile.cgpa}</dd>
        </div>
      </dl>
    </Section>
  );
}

function JourneyRow({ event, latest = false }: { event: CareerEvent; latest?: boolean }) {
  const related = (event.relatedProjects ?? []).map((slug) => getProject(slug)).filter((project) => project !== undefined);
  /* Only ARIV carries a public repository, so the extra source link appears
     when the record actually has one rather than being hard-coded per row. */
  const repository = related.find((project) => project.githubUrl)?.githubUrl;
  /* A project row carries that project's own accent (the same token the work
     archive uses), so the mark, node and links read as one identity. Rows
     without a project keep their type accent. */
  const accent = related[0]?.accent ?? accentByType[event.type];

  return (
    <article
      className="journey__item"
      data-accent={accent}
      data-priority={event.priority}
      data-latest={latest || undefined}
    >
      <div className="journey__marker" aria-hidden="true">
        <span className="journey__dot" />
      </div>

      <div className="journey__when">
        <span className="journey__year">{event.year}</span>
        {event.date ? <span className="journey__date">{event.date}</span> : null}
      </div>

      <div className="journey__body">
        <p className="journey__tag">
          <span className="journey__tag-dot" aria-hidden="true" />
          {tagByType[event.type]}
        </p>

        <div className="journey__heading">
          <JourneyMark type={event.type} project={related[0]} />
          <div className="journey__title-group">
            <h3 className="journey__title">{event.title}</h3>
            {event.subtitle ? <p className="journey__subtitle">{event.subtitle}</p> : null}
          </div>
        </div>

        {event.organization ? <p className="journey__org">{event.organization}</p> : null}
        <p className="journey__desc">{event.description}</p>

        {related.length > 0 ? (
          <ul className="journey__links">
            {related.map((project) => (
              <li key={project.slug}>
                <Link href={`/work/${project.slug}`} className="journey__project-link">
                  <ProjectMark slug={project.slug} title={project.title} size={16} />
                  <span>{event.linkLabel ?? "Open case study"}</span>
                  <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
            {repository ? (
              <li>
                <a href={repository} target="_blank" rel="noreferrer noopener">
                  Repository
                  <span aria-hidden="true">↗</span>
                </a>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </article>
  );
}