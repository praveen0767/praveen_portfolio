import { getTechnology } from "../../content/tech";
import type { Tech } from "../../content/tech";

export function techBrand(tech: Tech | undefined) {
  return tech?.accent ?? tech?.hex ?? "#7C8DB5";
}

function initials(name: string) {
  const parts = name.split(/[^A-Za-z0-9+]+/).filter(Boolean);
  const letters = parts.length > 1 ? parts.map((part) => part[0]) : name.split(" ");
  return letters
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Real brand mark when the technology has one, an honest monogram when it
 * does not. Never a fake logo.
 */
export function TechLogo({
  name,
  size = 18,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const tech = getTechnology(name);
  const brand = techBrand(tech);

  if (!tech?.logo) {
    return (
      <span
        className={`tech-mark tech-mark-mono ${className}`.trim()}
        style={{ "--brand": brand, width: size, height: size } as React.CSSProperties}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
    );
  }

  return (
    <span
      className={`tech-mark ${className}`.trim()}
      style={{ "--brand": brand, width: size, height: size } as React.CSSProperties}
    >
      {/* Local asset: brand colours stay recognisable and no external host is contacted. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/tech/${tech.logo}.svg`} alt="" width={size} height={size} loading="lazy" decoding="async" />
    </span>
  );
}

/** Technology name with its brand mark. Used in project stacks and archive rows. */
export function TechChip({ name, size = 16 }: { name: string; size?: number }) {
  const tech = getTechnology(name);
  return (
    <span className="tech-chip" style={{ "--brand": techBrand(tech) } as React.CSSProperties}>
      <TechLogo name={name} size={size} />
      <span>{name}</span>
    </span>
  );
}