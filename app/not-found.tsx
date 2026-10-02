import Link from "next/link";
import { Container } from "../components/layout/Container";
import { LinkButton } from "../components/ui/Button";

const routes = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/engineering", label: "Engineering" },
  { href: "/proof", label: "Proof" },
  { href: "/lab", label: "Lab" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <section className="not-found">
      <Container>
        <p className="eyebrow">
          <span className="eyebrow__rule" aria-hidden="true" />
          404 / Route not found
        </p>
        <h1 className="not-found__title">This route does not exist.</h1>
        <p className="not-found__body">
          The page you asked for is not part of this site. Nothing was deleted — it was never here, or the address
          has a typo.
        </p>

        <ul className="not-found__routes">
          {routes.map((route) => (
            <li key={route.href}>
              <Link href={route.href}>{route.label}</Link>
            </li>
          ))}
        </ul>

        <LinkButton href="/">
          Back to home
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </LinkButton>
      </Container>
    </section>
  );
}