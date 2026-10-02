export const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/engineering", label: "Engineering" },
  { href: "/proof", label: "Proof" },
  { href: "/lab", label: "Lab" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** Secondary links shown inside the mobile menu. */
export const mobileNavLinks = [
  ...navLinks,
  { href: "/#toolkit", label: "Toolkit" },
  { href: "/#journey", label: "Journey" },
] as const;