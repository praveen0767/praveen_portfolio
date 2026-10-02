"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { mobileNavLinks, navLinks } from "./nav-links";
import { profile } from "../../content/profile";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  /**
   * The open menu is stored with the path it was opened on, so a navigation
   * always closes it without a setState inside an effect.
   */
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header" data-scrolled={scrolled ? "true" : undefined} data-open={open ? "true" : undefined}>
      <div className="container navbar">
        <Link className="wordmark" href="/" aria-label="Praveen Kumar S, home">
          <span className="wordmark__dot" aria-hidden="true" />
          PRAVEEN.KUMAR
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className="nav-link"
              href={link.href}
              data-active={isActive(link.href) ? "true" : undefined}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link className="nav-cta" href={profile.resumePath} target="_blank" rel="noopener noreferrer">
            Resume
            <span className="nav-cta__arrow" aria-hidden="true">
              ↗
            </span>
          </Link>

          <button
            ref={triggerRef}
            className="menu-trigger"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpenedOn(open ? null : pathname)}
          >
            <span className="menu-trigger__bars" aria-hidden="true">
              <span />
              <span />
            </span>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <MobileMenu open={open} onClose={() => setOpenedOn(null)} triggerRef={triggerRef} />
    </header>
  );
}

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

function MobileMenu({ open, onClose, triggerRef }: MobileMenuProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = menuRef.current?.querySelectorAll<HTMLAnchorElement>("a");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open, onClose, triggerRef]);

  return (
    <div className="mobile-menu-shell" id="mobile-navigation" data-open={open ? "true" : undefined} hidden={!open}>
      <nav ref={menuRef} className="mobile-menu" aria-label="Mobile navigation">
        {mobileNavLinks.map((link) => (
          <Link
            key={link.href}
            className="mobile-nav-link"
            href={link.href}
            onClick={onClose}
            data-active={pathname === link.href ? "true" : undefined}
          >
            {link.label}
          </Link>
        ))}
        <Link
          className="mobile-nav-link mobile-nav-link--cta"
          href={profile.resumePath}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
        >
          Resume <span aria-hidden="true">↗</span>
        </Link>
      </nav>
    </div>
  );
}