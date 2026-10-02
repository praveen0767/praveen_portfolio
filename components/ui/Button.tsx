import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "outline" | "ghost" | "quiet";

export function buttonClass(variant: Variant = "primary", extra = "") {
  return ["btn", `btn--${variant}`, extra].filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={buttonClass(variant, className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  className = "",
  children,
  href,
  target,
  rel,
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  href: string;
  children: ReactNode;
}) {
  const classes = buttonClass(variant, className);
  const isExternal = target === "_blank" || href.startsWith("mailto:") || href.startsWith("http");

  if (isExternal) {
    return (
      <a
        className={classes}
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>
      {children}
    </Link>
  );
}