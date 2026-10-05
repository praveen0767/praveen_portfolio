import { profile } from "./profile";
import { orderedProjects } from "./projects";
import { achievements } from "./proof/achievements";
import { experiments } from "./lab/experiments";
import { notes } from "./lab/notes";
import { buildLog } from "./lab/build-log";

export type AccentName = "electric" | "violet" | "cyan" | "lime" | "orange" | "pink";

export type DockEntry = {
  index: string;
  href: string;
  label: string;
  /** Shown as the small preview line under the label. */
  context: string;
  accent: AccentName;
  external?: boolean;
};

/**
 * The "quick access" rail under the hero. Every count is derived from the same
 * content the rest of the site renders, so the dock can never overstate the work.
 */
export function accessDock(): DockEntry[] {
  const labPublished = experiments.length + notes.length + buildLog.length;

  return [
    {
      index: "01",
      href: "/work",
      label: "Work",
      context: `${orderedProjects().length} systems, architecture included`,
      accent: "electric",
    },
    {
      index: "02",
      href: "/engineering",
      label: "Engineering",
      context: "How I turn a problem into a system",
      accent: "cyan",
    },
    {
      index: "03",
      href: "/lab",
      label: "Lab",
      context: labPublished > 0 ? `${labPublished} published entries` : "Garage — nothing padded",
      accent: "lime",
    },
    {
      index: "04",
      href: "/proof",
      label: "Proof",
      context: `${achievements.length} records, ${achievements.filter((a) => a.tier === 1).length} championships`,
      accent: "orange",
    },
    {
      index: "05",
      href: "/about",
      label: "About",
      context: "The person behind the code",
      accent: "violet",
    },
    {
      index: "06",
      href: profile.resumePath,
      label: "Resume",
      context: profile.resumeLabel,
      accent: "pink",
      external: true,
    },
    {
      index: "07",
      href: "/contact",
      label: "Contact",
      context: profile.email,
      accent: "electric",
    },
  ];
}

/** Short proof-wall grouping so the homepage does not repeat the full record. */
export function proofHighlights() {
  const ranked = [...achievements].sort((a, b) => a.tier - b.tier);
  return {
    champions: ranked.filter((achievement) => achievement.tier === 1),
    finalists: ranked.filter((achievement) => achievement.tier === 2),
    rest: ranked.filter((achievement) => achievement.tier === 3),
    total: achievements.length,
  };
}