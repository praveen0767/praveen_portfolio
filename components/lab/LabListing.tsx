import Link from "next/link";
import { Section } from "../layout/Section";
import { buildLog } from "../../content/lab/build-log";
import type { BuildLogEntry } from "../../content/lab/types";
import { experiments } from "../../content/lab/experiments";
import type { Experiment } from "../../content/lab/types";
import { notes } from "../../content/lab/notes";
import type { LabNote } from "../../content/lab/types";

type ListingType = "experiments" | "notes" | "build-log";

const meta: Record<ListingType, { title: string; eyebrow: string; lede: string }> = {
  experiments: {
    title: "Experiments",
    eyebrow: "Lab / Experiments",
    lede: "A question, a hypothesis, a method, a result. Inconclusive outcomes are published as inconclusive.",
  },
  notes: {
    title: "Engineering notes",
    eyebrow: "Lab / Notes",
    lede: "Written thinking on architecture, retrieval, agents and the decisions behind the systems.",
  },
  "build-log": {
    title: "Build log",
    eyebrow: "Lab / Build log",
    lede: "A chronological record of what gets built, changed and abandoned.",
  },
};

export function LabListing({ type }: { type: ListingType }) {
  const { title, eyebrow, lede } = meta[type];
  const empty = countFor(type) === 0;

  return (
    <>
      <div className="container lab-listing__back">
        <Link className="back-link" href="/lab">
          <span aria-hidden="true">←</span> Lab
        </Link>
      </div>

      <Section tone={empty ? "light" : "dark"} eyebrow={eyebrow} heading={title} lede={lede}>
        {type === "build-log" ? <BuildLog entries={buildLog} /> : null}
        {type === "experiments" ? <Shelf type={type} items={experiments} /> : null}
        {type === "notes" ? <Shelf type={type} items={notes} /> : null}
        {empty ? <EmptyShelf type={type} /> : null}
      </Section>
    </>
  );
}

function countFor(type: ListingType) {
  if (type === "experiments") return experiments.length;
  if (type === "notes") return notes.length;
  return buildLog.length;
}

type ShelfItem = Experiment | LabNote;

function Shelf({ type, items }: { type: "experiments" | "notes"; items: ShelfItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="shelf-cards">
      {items.map((item) => (
        <li key={item.slug}>
          <Link className="shelf-card" href={`/lab/${type}/${item.slug}`}>
            <span className="shelf-card__meta">
              <span className="shelf-card__date">{item.date}</span>
              <span className="shelf-card__tag">
                {"category" in item ? item.category : item.status}
              </span>
            </span>
            <span className="shelf-card__title">{item.title}</span>
            <span className="shelf-card__desc">
              {"description" in item ? item.description : item.question}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function BuildLog({ entries }: { entries: BuildLogEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <ol className="log">
      {entries.map((entry) => (
        <li key={entry.id} className="log__entry">
          <span className="log__date">{entry.date}</span>
          <div className="log__body">
            <h3 className="log__title">
              {entry.link ? (
                <a href={entry.link} target="_blank" rel="noopener noreferrer">
                  {entry.title}
                </a>
              ) : (
                entry.title
              )}
            </h3>
            <p className="log__desc">{entry.description}</p>
            {entry.relatedProject ? (
              <Link className="log__link" href={`/work/${entry.relatedProject}`}>
                Related project <span aria-hidden="true">→</span>
              </Link>
            ) : null}
          </div>
          <span className="log__category">{entry.category}</span>
        </li>
      ))}
    </ol>
  );
}

function EmptyShelf({ type }: { type: ListingType }) {
  return (
    <div className="empty-state-note">
      <p className="empty-state-note__title">This shelf is empty.</p>
      <p>
        There are no published {meta[type].title.toLowerCase()} yet. Rather than filling the page, the shelf stays
        empty until there is real work worth publishing.
      </p>
      <Link className="empty-state-note__link" href="/lab">
        Back to the lab <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}