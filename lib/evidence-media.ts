/**
 * Evidence media framing.
 *
 * Two separate questions are answered here, because the photographs attached to
 * competition records are not interchangeable:
 *
 *  1. WHAT RATIO — each frame is mounted at the photograph's own measured
 *     aspect ratio, so nothing is stretched and nothing decides the page layout.
 *     Every entry below was read off the file itself, not guessed from a name.
 *
 *  2. WHAT FIT — photographic evidence (a stage, a team, a winner board) is
 *     immersive and may be `cover`-mounted, while documents (certificates,
 *     result letters, invitations) must stay whole and legible, so they are
 *     `contain`-mounted on a neutral card.
 *
 * The homepage proof wall keeps using the ratio alone; the archive additionally
 * asks for the fit policy.
 */

const ASPECT: Record<string, string> = {
  /* Tier 1 — championship records (photographic stage evidence) */
  "/samartha.jpeg": "4 / 3", // 4080x3060
  "/Tradewin.png": "16 / 9", // 800x450

  /* Tier 2 — national recognition */
  "/Volkawagen_fina;.jpeg": "49 / 25", // 1280x651
  "/sansad.jpg": "1 / 1", // 800x800
  "/startuptn,jpeg.jpeg": "9 / 20", // 718x1600 — portrait invitation certificate
  "/iit_sriccity.jpeg": "5 / 7", // 1080x1508 — portrait certificate

  /* Tier 3 — merit / regional */
  "/Panimalar_intelliconz.jpeg": "20 / 9", // 1600x720 — wide certificate
  "/data_analysis.jpeg": "24 / 11", // 1600x737 — wide result letter
  "/agni_clg.jpeg": "7 / 6", // 1600x1364 — result certificate
  "/rmk_clg.jpeg": "3 / 2", // 1280x853 — result certificate

  /* Supporting evidence */
  "/startuptn_product.jpeg": "16 / 9", // 1600x838
  "/volkswagen_project_pic.jpeg": "7 / 5", // 937x653
};

/**
 * Which photographs may be cropped to fill their frame.
 *
 * `cover` is granted only to photographic evidence where the subject is a
 * person, a team or a stage: cropping the frame edges does not remove the
 * record. Documents stay `contain` — a result line cropped out of a certificate
 * would make the archive lie about what it documents.
 */
const COVER_FIT = new Set<string>([
  "/samartha.jpeg",
  "/Tradewin.png",
  "/Volkawagen_fina;.jpeg",
  "/volkswagen_project_pic.jpeg",
  "/sansad.jpg",
  "/startuptn_product.jpeg",
]);

/** The frame ratio an evidence photograph should be mounted at. */
export function evidenceAspect(src: string | null | undefined): string {
  if (!src) return "4 / 3";
  return ASPECT[src] ?? "4 / 3";
}

/**
 * Whether the image may fill its frame (`cover`) or must stay whole (`contain`).
 */
export function evidenceFit(src: string | null | undefined): "cover" | "contain" {
  if (!src) return "contain";
  return COVER_FIT.has(src) ? "cover" : "contain";
}

/**
 * Inline style carrying the frame ratio as a custom property.
 *
 * Set as a custom property rather than a direct `aspectRatio` so the
 * component's own CSS can pair it with a `max-height` cap per tier and keep
 * one rule in charge of the mount.
 */
export function evidenceFrameStyle(
  src: string | null | undefined,
): React.CSSProperties {
  return { "--media-ar": evidenceAspect(src) } as React.CSSProperties;
}