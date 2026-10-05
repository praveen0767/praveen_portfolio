import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { TechChip } from "../ui/TechLogo";
import { LinkButton } from "../ui/Button";
import { achievements } from "../../content/proof/achievements";
import type { Achievement } from "../../content/proof/achievements";
import { experiences } from "../../content/proof/experience";
import { proofSignals, trajectory } from "../../content/proof";
import { profile } from "../../content/profile";

const champions = achievements.filter((achievement) => achievement.tier === 1);
const finalists = achievements.filter((achievement) => achievement.tier === 2);
const rest = achievements.filter((achievement) => achievement.tier === 3);

export function ProofPage() {
  return (
    <>
      <Section
        tone="dark"
        eyebrow="Proof"
        heading="Evidence, not adjectives."
        headingLevel={1}
        lede="Competition results, a paid internship, and prototype systems with their limits documented. Every entry below is on the record."
      >
        <ul className="tally">
          <li>
            <span className="tally__value">7+</span>
            <span className="tally__label">National Hackathon Wins</span>
          </li>
          <li>
            <span className="tally__value">15+</span>
            <span className="tally__label">Merit Wins</span>
          </li>
          <li>
            <span className="tally__value">50+</span>
            <span className="tally__label">Hackathons Participated</span>
          </li>
          <li>
            <span className="tally__value">{achievements.length}</span>
            <span className="tally__label">Verified records attached</span>
          </li>
        </ul>

        <p className="proof-note" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          Aggregate claims provided by Praveen; archive below contains individually documented records.
        </p>
      </Section>

      <Section
        tone="light"
        eyebrow="Experience"
        heading="Work inside a product team."
        lede="A paid internship where generative AI models were integrated into real application workflows."
      >
        {experiences.map((experience) => (
          <article key={experience.id} className="experience">
            <div className="experience__head">
              <div>
                <p className="experience__role">{experience.role}</p>
                <p className="experience__org">
                  {experience.organization}
                  {experience.location ? ` · ${experience.location}` : ""}
                </p>
              </div>
              <div className="experience__meta">
                <span className="experience__period">{experience.period}</span>
                <span className="experience__type">{experience.type}</span>
              </div>
            </div>

            <p className="experience__summary">{experience.summary}</p>

            <div className="experience__grid">
              <div>
                <span className="experience__label">Responsibilities</span>
                <Bullets items={experience.responsibilities} />
              </div>
              <div>
                <span className="experience__label">Engineering work</span>
                <Bullets items={experience.engineering} />
              </div>
              <div>
                <span className="experience__label">Outcomes</span>
                <Bullets items={experience.outcomes} />
              </div>
            </div>

            <ul className="experience__stack">
              {experience.technologies.map((tech) => (
                <li key={tech}>
                  <TechChip name={tech} size={14} />
                </li>
              ))}
            </ul>
          </article>
        ))}
      </Section>

      <Section
        eyebrow="Competition"
        heading="Championships first, then the results that got there."
        lede="National hackathons and technical challenges where a working system had to exist by the deadline."
      >
        <div className="record-field">
          <ul className="record-field__list">
            {champions.map((achievement) => (
              <Reveal as="li" key={achievement.id}>
                <Record achievement={achievement} />
              </Reveal>
            ))}
          </ul>
        </div>

        <h3 className="record-subhead">National finalists</h3>
        <ul className="record-grid">
          {finalists.map((achievement) => (
            <Reveal as="li" key={achievement.id}>
              <Record achievement={achievement} compact />
            </Reveal>
          ))}
        </ul>

        <h3 className="record-subhead">Also on the record</h3>
        <ul className="record-list">
          {rest.map((achievement) => (
            <li key={achievement.id} className="record-line">
              <span className="record-line__result">{achievement.result}</span>
              <span className="record-line__event">{achievement.event}</span>
              <span className="record-line__org">{achievement.organization}</span>
              <AchievementYear achievement={achievement} />
            </li>
          ))}
        </ul>
      </Section>

      <Section
        tone="light"
        eyebrow="Signals"
        heading="What the record actually says about how I work."
        lede="Read as capability statements, each one backed by a project or a result above."
      >
        <ul className="signals">
          {proofSignals.map((signal, index) => (
            <Reveal as="li" key={signal.label} delay={index * 60}>
              <span className="signals__index">0{index + 1}</span>
              <span className="signals__label">{signal.label}</span>
              <span className="signals__detail">{signal.detail}</span>
            </Reveal>
          ))}
        </ul>

        <ol className="trajectory">
          {trajectory.map((step, index) => (
            <li key={step}>
              <span className="trajectory__step">{String(index + 1).padStart(2, "0")}</span>
              <span className="trajectory__label">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="dark" eyebrow="Next" heading="Want the written record instead?" className="section--contact">
        <div className="proof-closing">
          <p>
            The resume has the same timeline in one page, with dates, roles and outcomes in a form you can forward.
          </p>
          <div className="proof-closing__actions">
            <LinkButton href={profile.resumePath} target="_blank">
              Download resume
              <span className="btn__arrow" aria-hidden="true">
                ↗
              </span>
            </LinkButton>
            <LinkButton href="/achievements" variant="outline">
              All achievements
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </LinkButton>
            <LinkButton href="/contact" variant="quiet">
              Get in touch
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </LinkButton>
          </div>
        </div>
      </Section>
    </>
  );
}

function AchievementYear({ achievement }: { achievement: Achievement }) {
  if (!/^\d{4}$/.test(achievement.year)) return null;
  return <span className="record__year">{achievement.year}</span>;
}

function Record({ achievement, compact = false }: { achievement: Achievement; compact?: boolean }) {
  return (
    <article className="record" data-tier={achievement.tier} data-compact={compact || undefined}>
      <div className="record__result">
        <span className="record__result-text">{achievement.result}</span>
        <span className="record__org">{achievement.organization}</span>
      </div>
      <div className="record__body">
        <h3 className="record__title">{achievement.event}</h3>
        <p className="record__contribution">{achievement.contribution}</p>
        <span className="record__meta">
          {achievement.category}
          <AchievementYear achievement={achievement} />
        </span>
      </div>
    </article>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="bullets">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}