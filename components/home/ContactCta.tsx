import { profile } from "../../content/profile";
import { LinkButton } from "../ui/Button";

const channels = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, external: false },
  { label: "LinkedIn", value: "Professional profile", href: profile.linkedin, external: true },
  { label: "GitHub", value: "Code and repositories", href: profile.github, external: true },
];

export function ContactCta() {
  return (
    <div className="contact-cta">
      <p className="contact-cta__eyebrow">
        <span className="contact-cta__dot" aria-hidden="true" />
        Open to technically ambitious work
      </p>
      <h2 className="contact-cta__title">
        Software engineering, applied AI, and systems that have to hold up in production.
      </h2>
      <p className="contact-cta__body">
        I am looking for software engineering work where the architecture matters, the AI has to be
        evaluated rather than assumed, and the person shipping it owns the whole system.
      </p>

      <div className="contact-cta__actions">
        <LinkButton href={`mailto:${profile.email}`}>
          {profile.email}
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </LinkButton>
        <LinkButton href={profile.resumePath} target="_blank" variant="outline">
          View resume
          <span className="btn__arrow" aria-hidden="true">
            ↗
          </span>
        </LinkButton>
      </div>

      <ul className="contact-cta__channels">
        {channels.map((channel) => (
          <li key={channel.label}>
            <a href={channel.href} target={channel.external ? "_blank" : undefined} rel={channel.external ? "noopener noreferrer" : undefined}>
              <span className="contact-cta__channel-label">{channel.label}</span>
              <span className="contact-cta__channel-value">{channel.value}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}