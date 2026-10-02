import type { HTMLAttributes, ReactNode } from "react";
import { Container } from "./Container";

export type SectionTone = "dark" | "light" | "white" | "gradient";

type SectionProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  id?: string;
  tone?: SectionTone;
  eyebrow?: string;
  heading?: string;
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
              {heading && <h2 className="section-title">{heading}</h2>}
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