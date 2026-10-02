import Image from "next/image";
import Link from "next/link";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { LinkButton } from "../ui/Button";
import { TechChip } from "../ui/TechLogo";
import { aboutPrinciples, profile } from "../../content/profile";
import { capabilities } from "../../content/home";
import { orderedProjects } from "../../content/projects";
import { achievements } from "../../content/proof/achievements";
import { developingTopics } from "../../content/engineering";

export function AboutPage() {
  const projects = orderedProjects();

  return (
    <>
      <Section tone="dark" eyebrow="About" className="about-hero">
        <div className="about-hero__grid">
          <div className="about-hero__copy">
            <p className="about-hero__eyebrow">
              <span className="hero__pulse" aria-hidden="true" />
              {profile.professionalTitle} / {profile.secondaryTitle}
            </p>
            <h1 className="about-hero__title">
              Software engineering, applied AI, and systems that keep working after the demo.
            </h1>
            <p className="about-hero__lede">{profile.heroStatement}</p>
            <ul className="about-hero__actions">
              <LinkButton href="/contact">
                Work with me
                <span className="btn__arrow" aria-hidden="true">
                  →
                </span>
              </LinkButton>
              <LinkButton href={profile.resumePath} target="_blank" variant="outline">
                Resume
                <span className="btn__arrow" aria-hidden="true">
                  ↗
                </span>
              </LinkButton>
            </ul>
          </div>

          <aside className="about-card">
            <Image
              className="about-card__portrait"
              src={profile.portraitPath}
              alt="Praveen Kumar S"
              width={348}
              height={457}
              sizes="(max-width: 1100px) 100vw, 340px"
              priority
            />
            <dl className="about-card__facts">
              <div>
                <dt>Based in</dt>
                <dd>{profile.location}</dd>
              </div>
              <div>
                <dt>Studying</dt>
                <dd>{profile.education}</dd>
                <dd className="about-card__muted">{profile.institution}</dd>
              </div>
              <div>
                <dt>Graduation</dt>
                <dd>{profile.educationPeriod}</dd>
                <dd className="about-card__muted">CGPA {profile.cgpa}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </Section>

      <Section
        tone="light"
        eyebrow="Thinking"
        heading="Four principles I keep coming back to."
        lede="They decide what I build, how I build it, and when I refuse to add another layer."
      >
        <ol className="about-principles">
          {aboutPrinciples.map((principle, index) => (
            <Reveal as="li" key={principle} delay={index * 70}>
              <span className="about-principles__index">0{index + 1}</span>
              <span className="about-principles__text">{principle}</span>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section
        eyebrow="What I work with"
        heading="Capability, stated as layers rather than adjectives."
        lede="Each capability below is demonstrated somewhere in the work archive."
      >
        <div className="about-capabilities">
          {capabilities.map((capability) => (
            <Reveal key={capability.id} delay={Number(capability.id === "product" ? 4 : 1) * 40}>
              <article className="about-capability" data-accent={capability.accent}>
                <h3 className="about-capability__label">{capability.label}</h3>
                <p className="about-capability__summary">{capability.summary}</p>
                <ul className="about-capability__items">
                  {capability.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        tone="light"
        eyebrow="Currently"
        heading="What is taking the time right now."
        lede="B.Tech in Artificial Intelligence and Data Science, with three shipped systems and a competition record behind them."
      >
        <div className="about-current">
          <div className="about-current__stack">
            <span className="about-current__label">Working with</span>
            <ul className="about-current__chips">
              {[...new Set(projects.flatMap((project) => project.technologies))].map((tech) => (
                <li key={tech}>
                  <TechChip name={tech} size={14} />
                </li>
              ))}
            </ul>
          </div>

          <div className="about-current__next">
            <span className="about-current__label">Developing next</span>
            <ul className="chip-list">
              {developingTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>

          <div className="about-current__proof">
            <span className="about-current__label">Proof so far</span>
            <p>
              {achievements.length} competition and certification records, including{" "}
              {achievements.filter((achievement) => achievement.tier === 1).length} championships.
            </p>
            <Link className="about-current__link" href="/proof">
              See the full record <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Section>

      <Section tone="dark" eyebrow="Say hello" heading="If any of this matches what you are building." className="section--contact">
        <div className="about-closing">
          <p>
            The fastest way to reach me is email. If you have a role, a project or a system that needs an owner,
            I would like to hear the specifics.
          </p>
          <LinkButton href={`mailto:${profile.email}`}>
            {profile.email}
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </LinkButton>
        </div>
      </Section>
    </>
  );
}