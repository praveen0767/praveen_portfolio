export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/engineering", label: "Engineering" },
  { href: "/proof", label: "Proof" },
  { href: "/achievements", label: "Achievements" },
  { href: "/lab", label: "Lab" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** Navigation links shown inside the mobile menu. */
export const mobileNavLinks = navLinks;