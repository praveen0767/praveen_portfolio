import Link from "next/link";
import { Container } from "./Container";
import { profile } from "../../content/profile";
import { navLinks } from "../navigation/nav-links";

const roles = ["Software Engineer", "AI Generalist", "AI Systems Builder"];

export function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-top">
          <div className="footer-brand">
            <p className="footer-name">PRAVEEN.KUMAR</p>
            <p className="footer-role">{roles.join(" / ")}</p>
            <p className="footer-location">
              {profile.location} <span aria-hidden="true">·</span> {profile.email}
            </p>
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
            <ul>
              <li>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={profile.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
              <li>
                <a href={`mailto:${profile.email}`}>Email</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>© {profile.copyrightYear} Praveen Kumar S</span>
          <span>Built with Next.js, TypeScript and no heavy animation runtime.</span>
        </div>
      </Container>
    </footer>
  );
}