import { technologies } from "../../content/tech";

/**
 * Slow technology ticker. Decorative and duplicated for a seamless loop — the
 * group is duplicated so translating by exactly 50% returns to the start frame.
 */
export function TechMarquee() {
  const items = technologies;

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <ul key={copy} className="marquee__group">
            {items.map((tech, index) => (
              <li key={`${copy}-${tech.id}-${index}`} className="marquee__item" style={{ "--brand": tech.accent ?? tech.hex } as React.CSSProperties}>
                <span className="marquee__dot" />
                {tech.name}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}