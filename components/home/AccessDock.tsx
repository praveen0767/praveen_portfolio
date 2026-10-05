import Link from "next/link";
import { Container } from "../layout/Container";
import { accessDock } from "../../content/navigation";

/**
 * The quick-access rail directly below the hero.
 *
 * It reads as an operating-system launcher rather than a nav list: each entry is
 * a block with an index, a large label and a live preview line. Every count is
 * derived from the same content the rest of the site renders.
 */
export function AccessDock() {
  const entries = accessDock();

  return (
    <div className="dock">
      <Container>
        <p className="dock__label">
          <span>Jump to</span>
          <span aria-hidden="true">{String(entries.length).padStart(2, "0")} destinations</span>
        </p>

        <nav className="dock__grid" aria-label="Quick access">
          {entries.map((entry) => {
            const body = (
              <>
                <span className="dock__index">{entry.index}</span>
                <span className="dock__label-text">{entry.label}</span>
                <span className="dock__context">{entry.context}</span>
                <span className="dock__arrow" aria-hidden="true">
                  ↗
                </span>
              </>
            );

            if (entry.external) {
              return (
                <a
                  key={entry.href}
                  className="dock__item"
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-accent={entry.accent}
                >
                  {body}
                  <span className="visually-hidden">(opens in a new tab)</span>
                </a>
              );
            }

            return (
              <Link key={entry.href} className="dock__item" href={entry.href} data-accent={entry.accent}>
                {body}
              </Link>
            );
          })}
        </nav>
      </Container>
    </div>
  );
}