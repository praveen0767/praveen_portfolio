import Link from "next/link";
import { buildLog } from "../../content/lab/build-log";
import { experiments } from "../../content/lab/experiments";
import { notes } from "../../content/lab/notes";
import { direction } from "../../content/lab/now";

export function LabPreview() {
  const shelves = [
    {
      href: "/lab/experiments",
      label: "Experiments",
      count: experiments.length,
      detail: "Questions, hypotheses and results for work that is still in progress.",
    },
    {
      href: "/lab/notes",
      label: "Engineering notes",
      count: notes.length,
      detail: "Written thinking on architecture, retrieval, agents and trade-offs.",
    },
    {
      href: "/lab/build-log",
      label: "Build log",
      count: buildLog.length,
      detail: "A chronological record of what gets built and changed.",
    },
  ];

  return (
    <div className="lab-preview">
      <div className="lab-preview__shelves">
        {shelves.map((shelf) => (
          <Link key={shelf.href} href={shelf.href} className="lab-preview__shelf">
            <span className="lab-preview__label">{shelf.label}</span>
            <span className="lab-preview__detail">{shelf.detail}</span>
            <span className="lab-preview__count">
              {shelf.count === 0 ? (
                <>
                  <span className="lab-preview__empty">Empty</span> published entries
                </>
              ) : (
                <>
                  <span className="lab-preview__count-number">{shelf.count}</span> published entries
                </>
              )}
            </span>
          </Link>
        ))}
      </div>

      <div className="lab-preview__direction">
        <span className="lab-preview__direction-label">Direction</span>
        <ul className="lab-preview__direction-list">
          {direction.now.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="lab-preview__note">
          The Lab publishes when there is something worth reading, not to fill space.
        </p>
        <Link className="lab-preview__cta" href="/lab">
          Open the lab
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}