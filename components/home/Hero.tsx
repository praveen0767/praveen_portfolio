import Image from "next/image";
import { Container } from "../layout/Container";
import { LinkButton } from "../ui/Button";
import { SystemMap } from "./SystemMap";
import { profile } from "../../content/profile";
import { orderedProjects } from "../../content/projects";
import { technologies } from "../../content/tech";

const roles: { label: string; accent: string }[] = [
  { label: "Software Engineer", accent: "electric" },
  { label: "AI Generalist", accent: "violet" },
  { label: "AI Systems Builder", accent: "cyan" },
];

const socials = [
  { label: "LinkedIn", href: profile.linkedin },
  { label: "GitHub", href: profile.github },
  { label: "Email", href: `mailto:${profile.email}` },
];

export function HeroPortrait() {
  return (
    <span className="hero__portrait">
      <Image src={profile.portraitPath} alt="" width={52} height={52} sizes="52px" priority />
      <span className="hero__portrait-ring" aria-hidden="true" />
    </span>
  );
}

export function Hero() {
  const shipped = orderedProjects().length;
  const marquee = [...technologies.map((tech) => tech.name), ...technologies.map((tech) => tech.name)];

  return (
    <>
      <section className="hero" id="top">
        <div className="hero__aurora" aria-hidden="true" />
        <div className="hero__grid-lines" aria-hidden="true" />
        <Container>
          <div className="hero__inner">
            <div className="hero__copy">
              <p className="hero__eyebrow">
                <span className="hero__pulse" aria-hidden="true" />
                Software Engineering <span aria-hidden="true">/</span> AI Systems <span aria-hidden="true">/</span> 2026
              </p>

              <h1 className="hero__title">
                <span className="hero__line">I build software</span>
                <span className="hero__line">systems that solve</span>
                <span className="hero__line hero__line--accent">real problems.</span>
              </h1>

              <ul className="hero__roles">
                {roles.map((role) => (
                  <li key={role.label} className={`hero__role hero__role--${role.accent}`}>
                    <span className="hero__role-dot" aria-hidden="true" />
                    {role.label}
                  </li>
                ))}
              </ul>

              <p className="hero__statement">{profile.heroStatement}</p>

              <div className="hero__actions">
                <LinkButton href="/work">
                  Explore Work
                  <span className="btn__arrow" aria-hidden="true">
                    →
                  </span>
                </LinkButton>
                <LinkButton href={profile.resumePath} target="_blank" variant="outline">
                  View Resume
                  <span className="btn__arrow" aria-hidden="true">
                    ↗
                  </span>
                </LinkButton>
              </div>

              <div className="hero__identity">
                <HeroPortrait />
                <div className="hero__identity-text">
                  <span className="hero__identity-name">{profile.name}</span>
                  <span className="hero__identity-meta">
                    {profile.location} <span aria-hidden="true">·</span> {shipped} systems shipped
                  </span>
                </div>
                <ul className="hero__socials">
                  {socials.map((social) => (
                    <li key={social.label}>
                      <a href={social.href} target={social.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer">
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="hero__visual">
              <SystemMap />
            </div>
          </div>
        </Container>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="marquee__group">
              {marquee.map((name, index) => (
                <li key={`${copy}-${name}-${index}`} className="marquee__item">
                  <span className="marquee__dot" />
                  {name}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </>
  );
}