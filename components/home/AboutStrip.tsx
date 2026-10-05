import Image from "next/image";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { LinkButton } from "../ui/Button";
import { Magnetic } from "../motion/Magnetic";
import { aboutPrinciples, profile } from "../../content/profile";
import { achievements } from "../../content/proof/achievements";

/**
 * The close of the homepage: me again.
 *
 * The story runs me → ARIV → the rest of the work → what I build with → how I
 * think → my journey → my proof → me. Ending on the person is what makes the
 * first "me" read as a person rather than a hero shot.
 */
export function AboutStrip() {
  const champions = achievements.filter((achievement) => achievement.tier === 1).length;

  return (
    <Section
      id="about"
      className="me"
      eyebrow="Me"
      heading="The engineer behind the systems."
      lede={profile.heroStatement}
      aside={
        <LinkButton href="/about" variant="quiet">
          Full about page
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </LinkButton>
      }
    >
      <div className="me__grid">
        <Reveal className="me__card">
          <Image
            className="me__portrait"
            src={profile.portraitPath}
            alt={`${profile.name}, ${profile.professionalTitle} in ${profile.location}`}
            width={348}
            height={457}
            sizes="(max-width: 900px) 62vw, 260px"
            loading="lazy"
          />
          <dl className="me__facts">
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Studying</dt>
              <dd>{profile.education}</dd>
              <dd className="me__facts-muted">{profile.institution}</dd>
            </div>
            <div>
              <dt>Record</dt>
              <dd>
                {achievements.length} achievements, {champions} championships
              </dd>
            </div>
          </dl>
        </Reveal>

        <Reveal className="me__principles" delay={90}>
          <p className="me__label">What I keep coming back to</p>
          <ol className="me__principles-list">
            {aboutPrinciples.map((principle, index) => (
              <li key={principle} className="me__principle">
                <span className="me__principle-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="me__principle-text">{principle}</span>
              </li>
            ))}
          </ol>

          <ul className="me__actions">
            <li>
              <Magnetic>
                <LinkButton href="/contact">
                  Get in touch
                  <span className="btn__arrow" aria-hidden="true">
                    →
                  </span>
                </LinkButton>
              </Magnetic>
            </li>
            <li>
              <Magnetic>
                <LinkButton href={profile.resumePath} target="_blank" variant="outline">
                  Resume
                  <span className="btn__arrow" aria-hidden="true">
                    ↗
                  </span>
                </LinkButton>
              </Magnetic>
            </li>
          </ul>
        </Reveal>
      </div>
    </Section>
  );
}
