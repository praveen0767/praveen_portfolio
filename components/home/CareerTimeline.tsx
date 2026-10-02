import Link from "next/link";
import { careerEvents } from "../../content/career";

const typeLabel: Record<string, string> = {
  EDUCATION: "Education",
  EXPERIENCE: "Experience",
  PROJECT: "Project",
  MILESTONE: "Milestone",
};

export function CareerTimeline() {
  return (
    <ol className="timeline">
      {careerEvents.map((event) => (
        <li key={event.id} className="timeline__item" data-priority={event.priority} data-type={event.type}>
          <span className="timeline__marker" aria-hidden="true" />
          <div className="timeline__when">
            <span className="timeline__date">{event.date ?? event.year}</span>
            <span className="timeline__type">{typeLabel[event.type] ?? event.type}</span>
          </div>
          <div className="timeline__body">
            <h3 className="timeline__title">{event.title}</h3>
            {event.organization ? <p className="timeline__org">{event.organization}</p> : null}
            <p className="timeline__desc">{event.description}</p>
            {event.relatedProjects?.length ? (
              <p className="timeline__links">
                {event.relatedProjects.map((slug) => (
                  <Link key={slug} href={`/work/${slug}`} className="timeline__link">
                    Case study
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}