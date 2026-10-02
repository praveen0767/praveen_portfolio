import Link from "next/link";
import { Section } from "../layout/Section";
import { LinkButton } from "../ui/Button";
import { direction } from "../../content/lab/now";
import { experiments } from "../../content/lab/experiments";
import { notes } from "../../content/lab/notes";
import { buildLog } from "../../content/lab/build-log";
import { profile } from "../../content/profile";

const shelves = [
  {
    href: "/lab/experiments",
    label: "Experiments",
    count: experiments.length,
    detail: "A question, a hypothesis, a method and a result — including the ones that were inconclusive.",
  },
  {
    href: "/lab/notes",
    label: "Engineering notes",
    count: notes.length,
    detail: "Written thinking on architecture, retrieval, agents and the trade-offs behind them.",
  },
  {
    href: "/lab/build-log",
    label: "Build log",
    count: buildLog.length,
    detail: "A chronological record of what gets built, changed and abandoned.",
  },
];

export function LabPage() {
  const published = experiments.length + notes.length + buildLog.length;

  return (
    <>
      <Section tone="dark" eyebrow="Lab" className="lab-hero">
        <p className="lab-hero__eyebrow">
          <span className="hero__pulse" aria-hidden="true" />
          Engineering lab
        </p>
        <h1 className="lab-hero__title">Work in progress, published honestly.</h1>
        <p className="lab-hero__lede">
          The Lab holds experiments, notes and a build log. Entries are published when there is something worth
          reading. Empty shelves are shown as empty rather than padded.
        </p>

        <ul className="lab-hero__stats">
          <li>
            <span className="lab-hero__stat-value">{published}</span>
            <span className="lab-hero__stat-label">Published entries</span>
          </li>
          <li>
            <span className="lab-hero__stat-value">3</span>
            <span className="lab-hero__stat-label">Shelves</span>
          </li>
          <li>
            <span className="lab-hero__stat-value">{direction.now.length}</span>
            <span className="lab-hero__stat-label">Current focus areas</span>
          </li>
        </ul>
      </Section>

      <Section tone="light" eyebrow="Shelves" heading="Three shelves.">
        <ul className="lab-shelves">
          {shelves.map((shelf) => (
            <li key={shelf.href}>
              <Link className="lab-shelf" href={shelf.href}>
                <span className="lab-shelf__label">{shelf.label}</span>
                <span className="lab-shelf__detail">{shelf.detail}</span>
                <span className="lab-shelf__count">
                  {shelf.count === 0 ? (
                    <>
                      <span className="lab-shelf__empty">Empty</span>
                      <span className="lab-shelf__empty-note">Nothing published yet</span>
                    </>
                  ) : (
                    <>
                      <span className="lab-shelf__count-number">{shelf.count}</span>
                      <span>published</span>
                    </>
                  )}
                </span>
                <span className="lab-shelf__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow="Direction"
        heading="What is taking the time right now."
        lede="Direction changes as the work changes. This is the current version."
      >
        <div className="direction">
          {[
            { label: "Building", items: direction.now, accent: "electric" },
            { label: "Learning", items: direction.next, accent: "violet" },
            { label: "Exploring", items: direction.later, accent: "cyan" },
          ].map((column) => (
            <div key={column.label} className="direction__column" data-accent={column.accent}>
              <span className="direction__label">{column.label}</span>
              <ul className="direction__list">
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="dark" eyebrow="Propose" heading="If you have a hard engineering problem, send it." className="section--contact">
        <div className="lab-closing">
          <p>
            The best lab entries so far have started as a question someone else asked. If you have one, email is
            the fastest way to start.
          </p>
          <LinkButton href={`mailto:${profile.email}`}>
            {profile.email}
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </LinkButton>
        </div>
      </Section>
    </>
  );
}