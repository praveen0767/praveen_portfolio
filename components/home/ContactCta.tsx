import { Container } from "../layout/Container";
import { LinkButton } from "../ui/Button";
import { FloatingObject } from "../motion/Depth";
import { Magnetic } from "../motion/Magnetic";
import { Parallax } from "../motion/Parallax";
import { contactChannels, profile } from "../../content/profile";
import { SocialIcon } from "../ui/SocialLinks";

/**
 * Closing section. Deliberately asymmetric: the email is the oversized element,
 * channels stack to the right, and a slow-rotating object sits behind them so the
 * page ends on motion instead of a centred sign-off.
 */
export function ContactCta() {
  return (
    <section className="contact-cta" id="contact">
      <Container>
        <div className="contact-cta__inner">
          <div className="contact-cta__copy">
            <p className="contact-cta__eyebrow">
              <span className="pulse-dot" aria-hidden="true" />
              {profile.baseLine}
            </p>

            <h2 className="contact-cta__title">
              Let&rsquo;s build something <em>worth deploying</em>.
            </h2>

            <p className="contact-cta__body">
              I am looking for software engineering work where the architecture matters, the AI gets evaluated
              rather than assumed, and the person shipping it owns the whole system.
            </p>

            <div className="contact-cta__actions">
              <Magnetic>
                <LinkButton href={`mailto:${profile.email}?subject=${encodeURIComponent(profile.emailSubject)}`} className="btn--lg">
                  {profile.email}
                  <span className="btn__arrow" aria-hidden="true">
                    →
                  </span>
                </LinkButton>
              </Magnetic>
              <Magnetic>
                <LinkButton href={profile.resumePath} target="_blank" variant="outline" className="btn--lg">
                  Resume
                  <span className="btn__arrow" aria-hidden="true">
                    ↗
                  </span>
                </LinkButton>
              </Magnetic>
            </div>
          </div>

          <div className="contact-cta__side">
            <Parallax
              distance={22}
              className="contact-cta__badge-parallax"
              style={{ top: "-18%", right: "-6%" }}
            >
              <FloatingObject
                depth={2}
                drift={7}
                duration={14}
                className="contact-cta__badge"
              >
                <span className="float">Based in India</span>
              </FloatingObject>
            </Parallax>

            <ul className="contact-channels contact-channels--compact">
              {contactChannels.map((channel) => (
                <li key={channel.label}>
                  <a
                    className="contact-channel"
                    href={channel.href}
                    target={channel.external ? "_blank" : undefined}
                    rel={channel.external ? "noopener noreferrer" : undefined}
                  >
                    <span className="contact-channel__icon" style={{ color: `var(--brand-${channel.id})` }}>
                      <SocialIcon id={channel.id} size={24} />
                    </span>
                    <span className="contact-channel__content">
                      <span className="contact-channel__label">{channel.label}</span>
                      <span className="contact-channel__value">{channel.description}</span>
                    </span>
                    <span className="contact-channel__arrow" aria-hidden="true">
                      {channel.external ? "↗" : "→"}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <LinkButton href="/contact" variant="quiet">
              Full contact page
              <span className="btn__arrow" aria-hidden="true">
                →
              </span>
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}