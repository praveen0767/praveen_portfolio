import type { ReactNode } from "react";
import { Magnetic } from "../motion/Magnetic";
import { channelById, socialOrder } from "../../content/profile";
import type { SocialId } from "../../content/profile";

/**
 * One icon set and one link table for the whole site.
 *
 * The destinations come from `content/profile`, so the hero, the footer and the
 * contact page cannot drift apart, and every mark carries its own brand colour
 * instead of the same monochrome tint.
 */

export function SocialIcon({ id, size = 18 }: { id: SocialId; size?: number }) {
  return (
    <svg
      className={`social-icon social-icon--${id}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {mark(id)}
    </svg>
  );
}

function mark(id: SocialId): ReactNode {
  switch (id) {
    case "github":
      return (
        <path
          fill="currentColor"
          d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
        />
      );

    case "linkedin":
      return (
        <path
          fill="currentColor"
          d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.25H3V9.75Zm6.5 0h3.83v1.54h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76v5.9h-4v-5.23c0-1.25-.02-2.86-1.8-2.86-1.8 0-2.07 1.35-2.07 2.77v5.32h-4V9.75Z"
        />
      );

    case "whatsapp":
      // Bubble + tail as one filled shape, handset punched out in the surface
      // colour: the silhouette reads as WhatsApp at 16px.
      return (
        <>
          <circle cx="12" cy="11.6" r="9.1" fill="currentColor" />
          <path d="M8.2 18.9 3.4 21.5l3.8-.7Z" fill="currentColor" />
          <g transform="translate(8.05 8.05) scale(0.34)">
            <path
              d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"
              fill="none"
              stroke="var(--social-cut)"
              strokeWidth="4.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        </>
      );

    case "instagram":
      return (
        <>
          <rect x="3.1" y="3.1" width="17.8" height="17.8" rx="5.2" stroke="currentColor" strokeWidth="1.9" />
          <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.9" />
          <circle cx="17.1" cy="6.9" r="1.15" fill="currentColor" />
        </>
      );

    case "email":
      return (
        <path
          fill="currentColor"
          d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Zm2.2-.5 6.8 5.1L18.8 6H5.2ZM19 7.9l-6.15 4.6a1 1 0 0 1-1.2 0L5 7.9V17.5c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5V7.9Z"
        />
      );
  }
}

type SocialLinksProps = {
  /** Defaults to the dock order used everywhere else on the site. */
  order?: SocialId[];
  /** Prefix for the generated ids, so the hero keeps its stable anchors. */
  idPrefix?: string;
  className?: string;
  ariaLabel?: string;
  size?: number;
  /** Wrap each link in the magnetic spring. Off where the row is already dense. */
  magnetic?: boolean;
};

export function SocialLinks({
  order = socialOrder,
  idPrefix,
  className = "",
  ariaLabel = "Social links",
  size = 18,
  magnetic = true,
}: SocialLinksProps) {
  return (
    <ul className={`socials ${className}`.trim()} aria-label={ariaLabel}>
      {order.map((id) => {
        const channel = channelById(id);
        const link = (
          <a
            className="social-btn"
            data-brand={id}
            href={channel.href}
            target={channel.external ? "_blank" : undefined}
            rel={channel.external ? "noopener noreferrer" : undefined}
            aria-label={channel.label}
            title={channel.label}
            id={idPrefix ? `${idPrefix}-social-${id}` : undefined}
          >
            <SocialIcon id={id} size={size} />
          </a>
        );

        return <li key={id}>{magnetic ? <Magnetic>{link}</Magnetic> : link}</li>;
      })}
    </ul>
  );
}
