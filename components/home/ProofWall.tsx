import Image from "next/image";
import Link from "next/link";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { LinkButton } from "../ui/Button";
import { champions, finalists, prizeOf } from "../../content/proof/achievements";
import type { Achievement } from "../../content/proof/achievements";
import { evidenceFrameStyle } from "../../lib/evidence-media";

/**
 * Homepage Proof section — compact, image-backed, FDE-framed.
 *
 * Hierarchy:
 *   1. Two championship records — primary, larger media
 *   2. Four national-stage records — compact, image-backed secondary cards
 *   3. Aggregate statistics
 *   4. CTA → /achievements
 *
 * Media rule: each frame declares the ratio its own photograph needs and
 * renders it with `object-fit: contain`, so a portrait certificate is centred
 * on a mount rather than cropped. See `lib/evidence-media.ts`.
 *
 * Copy principle: "Different problems. Different environments. One recurring
 * habit: understand fast, build under constraints, and keep improving."
 */
function EvidenceCard({
  record,
  minor = false,
}: {
  record: Achievement;
  minor?: boolean;
}) {
  const prize = prizeOf(record);
  return (
    <article
      className={`proof-card${minor ? " proof-card--minor" : " proof-card--champion"}`}
      data-accent={minor ? "electric" : "orange"}
    >
      {record.imagePath ? (
        <Link
          href="/achievements"
          className="proof-card__img-link"
          aria-label={`View all achievements: ${record.event}`}
        >
          <div
            className="proof-card__img-wrap"
            /* Primary records are framed at their own photograph's ratio. The four
               secondary cards share one square frame instead, so the row reads as
               a single band of equal weight; `contain` keeps every one of them
               whole inside it. */
            style={minor ? undefined : evidenceFrameStyle(record.imagePath)}
          >
            <Image
              src={record.imagePath}
              alt={`Evidence: ${record.title}`}
              width={minor ? 400 : 560}
              height={minor ? 300 : 420}
              className="proof-card__img"
              sizes={
                minor
                  ? "(max-width: 460px) 92vw, (max-width: 1000px) 46vw, 24vw"
                  : "(max-width: 767px) 92vw, 480px"
              }
            />
            <span className="proof-card__img-cue" aria-hidden="true">
              VIEW ALL ACHIEVEMENTS ↗
            </span>
          </div>
        </Link>
      ) : null}
      <div className="proof-card__body">
        <p className="proof-card__eyebrow">
          {!minor && (
            <span className="proof-card__crown" aria-hidden="true">
              ★
            </span>
          )}
          {minor ? record.category : "Champion"}
        </p>
        {prize ? (
          <p className="proof-card__prize">{prize}</p>
        ) : (
          <p className="proof-card__result">{record.result}</p>
        )}
        <h3 className="proof-card__title">{record.event}</h3>
        <p className="proof-card__org">
          {record.organization}
          <span aria-hidden="true"> · </span>
          {record.year}
        </p>
      </div>
    </article>
  );
}

export function ProofWall() {
  const primary = champions.slice(0, 2);
  const secondary = finalists.slice(0, 4);

  return (
    <Section
      id="proof-wall"
      eyebrow="Proof"
      heading="Built under pressure. Shipped with purpose."
      lede="Different problems. Different environments. One recurring habit: understand fast, build under constraints, and keep improving."
      aside={
        <LinkButton href="/achievements" variant="quiet">
          View all achievements
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </LinkButton>
      }
    >
      {/* ── Primary: championship records ── */}
      <Reveal className="proof-wall__champions">
        {primary.map((record) => (
          <EvidenceCard key={record.id} record={record} />
        ))}
      </Reveal>

      {/* ── Secondary: national-stage records ── */}
      <Reveal delay={80} className="proof-wall__minors">
        {secondary.map((record) => (
          <EvidenceCard key={record.id} record={record} minor />
        ))}
      </Reveal>

      {/* ── Aggregate statistics ── */}
      <Reveal delay={120} className="proof-wall__stats">
        <div className="proof-stat">
          <span className="proof-stat__value">50+</span>
          <span className="proof-stat__label">Hackathons Participated</span>
        </div>
        <div className="proof-stat">
          <span className="proof-stat__value">7+</span>
          <span className="proof-stat__label">National Hackathon Wins</span>
        </div>
        <div className="proof-stat">
          <span className="proof-stat__value">15+</span>
          <span className="proof-stat__label">Merit Wins</span>
        </div>
      </Reveal>

      <p className="proof-note">
        Aggregate claims provided by Praveen; archive below contains individually documented records.
        Every competition above required a working system by deadline — not a deck, not a wireframe.
        The full evidence record, with images and dates, is{" "}
        <LinkButton href="/achievements" variant="quiet">in the achievements archive</LinkButton>.
      </p>
    </Section>
  );
}