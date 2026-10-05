import Link from "next/link";
import { Container } from "./Container";
import { profile } from "../../content/profile";
import { navLinks } from "../navigation/nav-links";
import { FloatingObject } from "../motion/Depth";
import { contactChannels } from "../../content/profile";
import { orderedProjects } from "../../content/projects";

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-top">
          <div className="footer-brand">
            <p className="footer-name">{profile.wordmark}</p>
            <p className="footer-role">Software Engineer · AI Systems Builder</p>
            <p className="footer-fde">Building toward Forward Deployed Engineering</p>
            <p className="footer-location">
              {profile.baseLine} <span aria-hidden="true">·</span> {profile.email}
            </p>
            <FloatingObject
              position={{ top: "-16%", right: "-4%" }}
              depth={3}
              drift={6}
              duration={16}
              className="footer-badge"
            >
              <span className="float">{profile.cgpa} CGPA</span>
            </FloatingObject>
          </div>

          <nav className="footer-nav" aria-label="Footer navigation">
            <span className="footer-nav__label">Navigate</span>
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
              <li>
                <Link href={profile.resumePath} target="_blank" rel="noopener noreferrer">
                  Resume
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="footer-nav" aria-label="Social links">
            <span className="footer-nav__label">Elsewhere</span>
            {/* Same table as the hero dock and the contact page — the footer
                cannot end up pointing somewhere the rest of the site does not. */}
            <ul>
              {contactChannels.map((channel) => (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    target={channel.external ? "_blank" : undefined}
                    rel={channel.external ? "noopener noreferrer" : undefined}
                  >
                    {channel.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>
            © {profile.copyrightYear} {profile.name}
          </span>
          <span>
            {orderedProjects().length} prototype systems documented here. Built with Next.js, TypeScript, CSS and
            Framer Motion — no WebGL and no 3D runtime.
          </span>
        </div>
      </Container>
    </footer>
  );
}