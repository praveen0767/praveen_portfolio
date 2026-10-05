import type { HTMLAttributes, ReactNode } from "react";
import { Container } from "./Container";

export type SectionTone = "dark" | "light" | "white" | "gradient";

type SectionProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  id?: string;
  tone?: SectionTone;
  eyebrow?: string;
  heading?: string;
  /**
   * Heading level for the section heading. A section that carries the page
   * identity should pass `1`; every other section stays at `2` so the outline
   * never skips a level.
   */
  headingLevel?: 1 | 2;
  lede?: ReactNode;
  /** Small slot on the right of the section header, e.g. a count or a link. */
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Removes the standard vertical padding when the caller controls rhythm. */
  flush?: boolean;
};

export function Section({
  id,
  tone = "dark",
  eyebrow,
  heading,
  headingLevel = 2,
  lede,
  aside,
  children,
  className = "",
  flush = false,
  ...props
}: SectionProps) {
  const classes = ["section", `section--${tone}`, flush ? "section--flush" : "", className]
    .filter(Boolean)
    .join(" ");

  const Heading = (headingLevel === 1 ? "h1" : "h2") as "h1" | "h2";

  return (
    <section id={id} className={classes} {...props}>
      <Container>
        {(eyebrow || heading || lede || aside) && (
          <header className="section-head">
            <div className="section-head__text">
              {eyebrow && (
                <p className="eyebrow">
                  <span className="eyebrow__rule" aria-hidden="true" />
                  {eyebrow}
                </p>
              )}
              {heading && <Heading className="section-title">{heading}</Heading>}
              {lede && <p className="section-lede">{lede}</p>}
            </div>
            {aside && <div className="section-head__aside">{aside}</div>}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}