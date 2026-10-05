"use client";

import Image from "next/image";
import { useState } from "react";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { LinkButton } from "../ui/Button";
import { ProjectMark } from "../ui/ProjectMark";
import { champions, finalists, meritRecords, prizeOf } from "../../content/proof/achievements";
import type { Achievement } from "../../content/proof/achievements";
import { experiences } from "../../content/proof/experience";
import { profile } from "../../content/profile";
import { getProject } from "../../content/projects";
import { evidenceFit, evidenceFrameStyle } from "../../lib/evidence-media";

/** Format a date string (YYYY-MM-DD, YYYY, or null) for display. */
function formatDate(date: string | null): string {
  if (!date) return "Date not established";
  if (/^\d{4}$/.test(date)) return date;
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

/**
 * One achievement record, built as evidence + result + context.
 *
 * The card is an explicit two-column grid — a media column sized by the tier and
 * a content column — so the photograph is a structural part of the record rather
 * than a thumbnail parked in a corner of a wide panel. Height is owned by the
 * card's `min-height`; the source image never sets it.
 */
function AchievementEntry({
  achievement,
  index,
}: {
  achievement: Achievement;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const prize = prizeOf(achievement);
  const secondImage = achievement.imagePath2;

  const alt =
    achievement.evidenceAlt ??
    `Evidence for ${achievement.title} at ${achievement.event}`;
  const alt2 = achievement.evidenceAlt2 ?? `Supporting evidence for ${achievement.title}`;

  return (
    <li className="achievement-entry" data-tier={achievement.tier}>
      {/* Spine node */}
      <span className="achievement-entry__node" aria-hidden="true">
        <span className="achievement-entry__node-core" />
      </span>

      <article className="achievement-card" aria-labelledby={`achievement-${achievement.id}-title`}>
        <span className="achievement-card__index" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Media column — first in the DOM so it also leads on mobile. */}
        {achievement.imagePath ? (
          <div className="achievement-card__media">
            <button
              className="achievement-card__img-btn"
              style={evidenceFrameStyle(achievement.imagePath)}
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={
                expanded
                  ? `Hide supporting evidence for ${achievement.title}`
                  : `Show supporting evidence for ${achievement.title}`
              }
            >
              <Image
                src={achievement.imagePath}
                alt={alt}
                width={800}
                height={600}
                className="achievement-card__img"
                data-fit={evidenceFit(achievement.imagePath)}
                sizes="(max-width: 767px) 100vw, (max-width: 1100px) 46vw, 420px"
              />
              {secondImage && !expanded ? (
                <span className="achievement-card__img-more" aria-hidden="true">+1</span>
              ) : null}
            </button>

            {expanded && secondImage ? (
              <div className="achievement-card__img-frame" style={evidenceFrameStyle(secondImage)}>
                <Image
                  src={secondImage}
                  alt={alt2}
                  width={800}
                  height={600}
                  className="achievement-card__img"
                  data-fit={evidenceFit(secondImage)}
                  sizes="(max-width: 767px) 100vw, 420px"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Content column — result first, then context, then org */}
        <div className="achievement-card__body">
          <div className="achievement-card__meta">
            <span className="achievement-card__date">{formatDate(achievement.date)}</span>
            <span className="achievement-card__category">{achievement.category}</span>
          </div>

          <p className="achievement-card__result" data-tier={achievement.tier}>
            {prize ?? achievement.result}
          </p>

          <h3 className="achievement-card__title" id={`achievement-${achievement.id}-title`}>
            {achievement.event}
          </h3>

          <p className="achievement-card__org">{achievement.organization}</p>

          <p className="achievement-card__contribution">{achievement.contribution}</p>
        </div>
      </article>
    </li>
  );
}

/**
 * Cross-link to the flagship build.
 *
 * ARIV is a system, not an award, so it is deliberately kept out of the
 * achievement taxonomy — it appears once as an explicit pointer so the Proof
 * story and the build story stay connected without corrupting the records.
 */
function FlagshipBuild() {
  /* Pulled from the existing project record so this cross-link can never drift
     from the real case study. ARIV is named here rather than parsed out of the
     record title, which also carries the recovery scope. */
  const ariv = getProject("ariv-agentic-revenue-recovery");
  if (!ariv) return null;

  return (
    <aside className="achievement-flagship" aria-labelledby="achievement-flagship-title">
      <div className="achievement-flagship__mark" aria-hidden="true">
        <ProjectMark slug={ariv.slug} title={ariv.title} size={36} strong />
      </div>
      <div className="achievement-flagship__body">
        <p className="achievement-flagship__eyebrow">Flagship Build</p>
        <h2 className="achievement-flagship__title" id="achievement-flagship-title">
          ARIV
          <span className="achievement-flagship__sub">Agentic Payment Recovery</span>
        </h2>
        <p className="achievement-flagship__note">
          Not an award — a system I built. Evaluated against the Razorpay Test Mode API.
        </p>
      </div>
      <LinkButton href={`/work/${ariv.slug}`} variant="outline">
        Explore ARIV
        <span className="btn__arrow" aria-hidden="true">↗</span>
      </LinkButton>
    </aside>
  );
}

/**
 * Full achievements archive page — vertical spine layout.
 *
 * Priority controls display order (per portfolio brief), not chronology.
 * Dates are shown next to each entry so the chronological story is clear
 * even though the display order follows portfolio signal strength.
 *
 * SANSAD is framed as Leadership / Public Policy — not political content.
 */
export function AchievementsPage() {
  const allByPriority = [...champions, ...finalists, ...meritRecords];

  return (
    <>
      {/* ── Hero header ── */}
      <Section
        tone="dark"
        eyebrow="Achievements"
        heading="The full record."
        headingLevel={1}
        lede="Competition, research, presentation and recognition — documented."
      >
        <ul className="tally">
          <li>
            <span className="tally__value">50+</span>
            <span className="tally__label">Hackathons Participated</span>
          </li>
          <li>
            <span className="tally__value">7+</span>
            <span className="tally__label">National Hackathon Wins</span>
          </li>
          <li>
            <span className="tally__value">15+</span>
            <span className="tally__label">Merit Wins</span>
          </li>
        </ul>

        <p className="proof-note">
          Aggregate claims provided by Praveen; archive below contains {allByPriority.length}{" "}
          individually documented records.
        </p>

        <FlagshipBuild />

        <p className="proof-fde-note">
          Different problems. Different environments. One recurring habit: understand fast, build under constraints, and keep improving.
          This is what Forward Deployed Engineering looks like in practice — before the title.
        </p>
      </Section>

      {/* ── Championship tier ── */}
      <Section eyebrow="Championships" heading="Wins with prize money attached.">
        <ul className="achievement-spine">
          {champions.map((a, i) => (
            <Reveal as="span" key={a.id} delay={i * 80}>
              <AchievementEntry achievement={a} index={i} />
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ── National finalist tier ── */}
      <Section tone="light" eyebrow="National Recognition" heading="Finalist results at the national stage.">
        <ul className="achievement-spine">
          {finalists.map((a, i) => (
            <Reveal as="span" key={a.id} delay={i * 60}>
              {/* Numbering stays global so the display priority reads 01–11. */}
              <AchievementEntry achievement={a} index={champions.length + i} />
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ── Merit / regional tier ── */}
      <Section eyebrow="Merit Records" heading="Regional and technical competition results.">
        <ul className="achievement-spine">
          {meritRecords.map((a, i) => (
            <Reveal as="span" key={a.id} delay={i * 50}>
              <AchievementEntry achievement={a} index={champions.length + finalists.length + i} />
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ── Work experience ── */}
      {experiences.length > 0 && (
        <Section tone="light" eyebrow="Experience" heading="Work inside a product team.">
          {experiences.map((exp) => (
            <article key={exp.id} className="experience">
              <div className="experience__head">
                <div>
                  <p className="experience__role">{exp.role}</p>
                  <p className="experience__org">
                    {exp.organization}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </p>
                </div>
                <div className="experience__meta">
                  <span className="experience__period">{exp.period}</span>
                  <span className="experience__type">{exp.type}</span>
                </div>
              </div>
              <p className="experience__summary">{exp.summary}</p>
            </article>
          ))}
        </Section>
      )}

      {/* ── Closing CTA ── */}
      <Section tone="dark" eyebrow="Next" heading="Want the condensed version?">
        <div className="proof-closing">
          <p>
            The resume has the same timeline in one page — roles, dates and outcomes in a format you can forward.
          </p>
          <div className="proof-closing__actions">
            <LinkButton href={profile.resumePath} target="_blank">
              View resume
              <span className="btn__arrow" aria-hidden="true">↗</span>
            </LinkButton>
            <LinkButton href="/contact" variant="outline">
              Get in touch
              <span className="btn__arrow" aria-hidden="true">→</span>
            </LinkButton>
          </div>
        </div>
      </Section>
    </>
  );
}
