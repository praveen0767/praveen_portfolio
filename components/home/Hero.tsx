import { Container } from "../layout/Container";
import { LinkButton } from "../ui/Button";
import { SocialLinks } from "../ui/SocialLinks";
import { HeroDepth } from "./HeroDepth";
import { DeveloperDesk } from "./DeveloperDesk";
import { Magnetic } from "../motion/Magnetic";
import { profile } from "../../content/profile";

/**
 * Homepage hero — FDE candidate first.
 *
 * Layout: copy on the left, large portrait on the right.
 * The portrait is the dominant visual object — nothing covers the face.
 *
 * First-viewport checklist (first 3–5 seconds):
 * ✓ Identity: FORWARD DEPLOYED ENGINEER CANDIDATE
 * ✓ Supporting: Software Engineer · AI Engineer · AI Systems Builder
 * ✓ Portrait prominent and clear, unobstructed
 * ✓ Primary CTA (Explore Work → /#ariv) and Resume CTA
 * ✓ Social links visible in normal flow, never absolute/fixed
 *
 * The Work CTA targets #/ariv so the first engineered artifact after meeting
 * Praveen is ARIV, the flagship evidence of FDE-style thinking.
 */
export function Hero() {
  return (
    <section className="hero" id="top">
      {/* Ambient background — texture, not composition. */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__bg-orb hero__bg-orb--1" />
        <div className="hero__bg-orb hero__bg-orb--2" />
        <div className="hero__bg-orb hero__bg-orb--3" />
        <div className="hero__bg-grid" />
      </div>

      <Container>
        <HeroDepth>
          <div className="hero__inner">
            {/* ── LEFT: Copy ─────────────────────────────────── */}
            <div className="hero__copy">
               {/* Personal label */}
               <p className="hero__eyebrow">
                 <span className="hero__eyebrow-text">
                   Software × AI × Systems
                 </span>
               </p>


              {/* Big headline — the primary professional direction */}
              <h1 className="hero__title">
                <span className="hero__title-hey">Hey, I&rsquo;m</span>
                <span className="hero__title-name">
                  Praveen
                  <span className="hero__title-dot" aria-hidden="true">
                    .
                  </span>
                </span>
              </h1>

               {/* Supporting identity line */}
               <p className="hero__roles" aria-label="Supporting professional identities">
                 <span className="hero__role" data-accent="electric">
                   Software Engineer
                 </span>
                 <span className="hero__role" data-accent="violet">
                   AI Engineer
                 </span>
                 <span className="hero__role" data-accent="cyan">
                   AI Systems Builder
                 </span>
                 <span className="hero__role hero__role--fde" data-accent="amber">
                   Forward Deployed Engineer
                 </span>
               </p>

              {/* One-line supporting statement — kept short */}
              <p className="hero__claim">
                I build and integrate{" "}
                <em>
                  software, AI and data systems around real-world problems.
                </em>
              </p>

              {/* Micro-content strip — five concise capability labels, not buzzword dump */}
              <ul className="hero__micro" aria-label="What I build with">
                {[
                  { label: "SOFTWARE", icon: "code" },
                  { label: "AI", icon: "sparkles" },
                  { label: "DATA", icon: "database" },
                  { label: "INTEGRATION", icon: "link" },
                  { label: "DEPLOYMENT", icon: "rocket" },
                ].map((item) => (
                  <li key={item.label} className="hero__micro-item">
                    <span
                      className="hero__micro-icon"
                      aria-hidden="true"
                    >
                      {item.icon === "code" ? (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="16 18 22 12 16 6" />
                          <polyline points="8 6 2 12 8 18" />
                        </svg>
                      ) : item.icon === "sparkles" ? (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" />
                          <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" />
                        </svg>
                      ) : item.icon === "database" ? (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <ellipse cx="12" cy="5" rx="9" ry="3" />
                          <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" />
                          <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
                        </svg>
                      ) : item.icon === "link" ? (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                      ) : (
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                        </svg>
                      )}
                    </span>
                    <span className="hero__micro-label">{item.label}</span>
                  </li>
                ))}
              </ul>

              {/* Primary CTAs */}
              <div className="hero__actions">
                <Magnetic>
                  <LinkButton
                    href="/#ariv"
                    className="btn--lg btn--primary-glow"
                    id="hero-work-cta"
                  >
                    Explore Work
                    <span className="btn__arrow" aria-hidden="true">
                      →
                    </span>
                  </LinkButton>
                </Magnetic>
                <Magnetic>
                  <LinkButton
                    href={profile.resumePath}
                    target="_blank"
                    variant="outline"
                    className="btn--lg"
                    id="hero-resume-cta"
                  >
                    View Resume
                    <span className="btn__arrow" aria-hidden="true">
                      ↗
                    </span>
                  </LinkButton>
                </Magnetic>
              </div>

              {/* Social row — normal flow, immediately below CTA actions */}
              <div className="hero__social-row">
                <SocialLinks idPrefix="hero" className="hero__socials" size={18} />
                <p className="hero__location">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {profile.baseLine}
                </p>
              </div>
            </div>

            {/* ── RIGHT: Portrait ────────────────────────────── */}
            <DeveloperDesk />
          </div>
        </HeroDepth>
      </Container>

      {/* Cue — tell the visitor where the page goes next */}
      <a className="hero__cue" href="#ariv">
        <span className="hero__cue-rail" aria-hidden="true">
          <span className="hero__cue-pulse" />
        </span>
        <span className="hero__cue-label">
          <span className="hero__cue-from">Me</span>
          <span className="hero__cue-arrow" aria-hidden="true">
            ↓
          </span>
          <span className="hero__cue-to">01 / ARIV</span>
        </span>
      </a>
    </section>
  );
}
