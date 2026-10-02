import Link from "next/link";
import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { LinkButton } from "../ui/Button";
import { contactChannels, profile } from "../../content/profile";

const whatToInclude = [
  "The problem and who it is for",
  "Constraints: deadline, data, hardware, budget",
  "What is already built and what is missing",
  "The outcome you would judge as success",
];

const notLookingFor = [
  "Work that is only prompt wrapping",
  "Teams that ship without evaluating AI output",
  "Unclear ownership of the system after handover",
];

export function ContactPage() {
  return (
    <>
      <Section tone="dark" eyebrow="Contact" className="contact-hero">
        <p className="contact-hero__eyebrow">
          <span className="hero__pulse" aria-hidden="true" />
          Open to software engineering and applied AI work
        </p>
        <h1 className="contact-hero__title">
          Tell me what you are building and what is currently in the way.
        </h1>
        <p className="contact-hero__lede">
          Email is the fastest route. I read every message and reply with either a direct answer or an honest
          reason I am not the right person for it.
        </p>
        <LinkButton href={`mailto:${profile.email}`}>
          {profile.email}
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </LinkButton>
      </Section>

      <Section
        tone="light"
        eyebrow="Channels"
        heading="Three ways to reach me, all verified."
        lede="No forms, no scheduling link, no funnel."
      >
        <ul className="contact-channels">
          {contactChannels.map((channel, index) => (
            <Reveal as="li" key={channel.label} delay={index * 70}>
              <a
                className="contact-channel"
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
              >
                <span className="contact-channel__label">{channel.label}</span>
                <span className="contact-channel__value">{channel.description}</span>
                <span className="contact-channel__arrow" aria-hidden="true">
                  {channel.external ? "↗" : "→"}
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow="Working together"
        heading="What helps me answer usefully."
        lede="Specifics beat pitch decks. This is what makes a first reply possible."
      >
        <div className="contact-grid">
          <div className="contact-grid__column">
            <h2 className="contact-subhead">Helpful to include</h2>
            <ul className="bullets">
              {whatToInclude.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="contact-grid__column">
            <h2 className="contact-subhead">What I am not looking for</h2>
            <ul className="bullets">
              {notLookingFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="light" eyebrow="Resume" heading="The one-page written record." id="resume">
        <div className="contact-resume">
          <p>
            Timeline, roles, outcomes and technologies on a single page. It is the same content as the Proof page,
            in a form you can forward.
          </p>
          <LinkButton href={profile.resumePath} target="_blank">
            Open {profile.resumeLabel}
            <span className="btn__arrow" aria-hidden="true">
              ↗
            </span>
          </LinkButton>
          <Link className="contact-resume__link" href="/proof">
            Or read the full record on this site <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Section>
    </>
  );
}