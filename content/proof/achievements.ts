export type AchievementCategory =
  | "WINS"
  | "FINALISTS / SHORTLISTS"
  | "PODIUM FINISHES"
  | "RESEARCH"
  | "PRESENTATIONS"
  | "POLICY / LEADERSHIP"
  | "OTHER RECOGNITION";

export type Achievement = {
  id: string;
  title: string;
  event: string;
  organization: string;
  /** ISO date string (YYYY-MM-DD) when known exactly; YYYY when only year is known; null when not established. */
  date: string | null;
  year: string;
  category: AchievementCategory;
  result: string;
  /** Honest one-line description of contribution. */
  contribution: string;
  /** Image asset in /public — confirmed mapping only. */
  imagePath?: string;
  /** Second image when available. */
  imagePath2?: string;
  /** Describes what the first photograph actually shows. Never "image" or "achievement". */
  evidenceAlt?: string;
  /** Same, for the supporting second photograph. */
  evidenceAlt2?: string;
  project?: string;
  evidenceUrl?: string;
  featured: boolean;
  /** 1 = championship / top prize | 2 = national finalist / top-30 | 3 = merit / regional */
  tier: 1 | 2 | 3;
};

/**
 * All verified achievement records.
 * Priority order for DISPLAY follows the portfolio brief:
 *  1. Samartha Winner
 *  2. NALSAR Trading Track Winner
 *  3. Volkswagen Top 30
 *  4. SANSAD 2026 Finalist
 *  5. StartupTN Pitch Stage
 *  6. IIIT Sri City Research Hackathon
 *  7. Intelliconz 2K25
 *  8. Data Analysis 1st
 *  9. Agni Project Presentation
 * 10. RMD Project Presentation
 * 11. CIPT Paper Presentation
 *
 * Display priority ≠ chronological order.
 * Each record cites only what is verifiable from the supplied evidence.
 */
export const achievements: Achievement[] = [
  // ── TIER 1: Championships ──────────────────────────────────────────────

  {
    id: "samartha-25-champion",
    title: "Champion — SAMARTHA'25 National Hackathon",
    event: "SAMARTHA'25 National Hackathon",
    organization: "SAMARTHA",
    date: "2025",
    year: "2025",
    category: "WINS",
    result: "Winner · ₹1,50,000",
    contribution: "Led end-to-end prototype design and delivery under competitive deadline.",
    imagePath: "/samartha.jpeg",
    evidenceAlt:
      "Praveen Kumar S with the SAMARTHA'25 team on stage beside the winner board at the National Hackathon final",
    featured: true,
    tier: 1,
  },

  {
    id: "nalsar-trading-track-winner",
    title: "Solo Champion — Trading Track",
    event: "Indian Startup Case Summit — Trading Track",
    organization: "NALSAR University of Law",
    date: "2026",
    year: "2026",
    category: "WINS",
    result: "Winner · ₹30,000",
    contribution: "Solo entry. Won the trading track competition.",
    imagePath: "/Tradewin.png",
    evidenceAlt:
      "Praveen Kumar S at the Indian Startup Case Summit with the ₹30,000 trading track winner board",
    featured: true,
    tier: 1,
  },

  // ── TIER 2: National finalists / Top-30 ───────────────────────────────

  {
    id: "volkswagen-imobilathon-5",
    title: "Top 30 National Shortlist — Volkswagen i.mobilathon 5.0",
    event: "Volkswagen i.mobilathon 5.0 Recruitment Hackathon",
    organization: "Volkswagen Group India",
    date: "2026",
    year: "2026",
    category: "FINALISTS / SHORTLISTS",
    result: "Top 30 National Shortlist",
    contribution: "Shortlisted nationally among entries from across India.",
    imagePath: "/Volkawagen_fina;.jpeg",
    imagePath2: "/volkswagen_project_pic.jpeg",
    evidenceAlt:
      "Volkswagen i.mobilathon 5.0 Top 30 national shortlist result for Praveen Kumar S",
    evidenceAlt2:
      "Project evidence submitted to Volkswagen i.mobilathon 5.0 by Praveen Kumar S",
    featured: true,
    tier: 2,
  },

  {
    id: "sansad-2026-national-finalist",
    title: "National Finalist — SANSAD 2026",
    event: "SANSAD 2026 — Simulated Parliamentary Debate",
    organization: "Public Policy & Governance Society, IIT Kharagpur",
    date: "2026",
    year: "2026",
    category: "POLICY / LEADERSHIP",
    result: "National Finalist",
    contribution:
      "Represented Rahul Gandhi in a national simulated parliamentary debate on the SHANTI Act 2025. Role required structured research, argumentation, critical listening and parliamentary procedure.",
    imagePath: "/sansad.jpg",
    evidenceAlt:
      "Praveen Kumar S speaking at the SANSAD 2026 simulated parliamentary debate at IIT Kharagpur",
    featured: true,
    tier: 2,
  },

  {
    id: "startuptn-tourism-innovation",
    title: "Advanced to Pitch Stage — StartupTN Tourism Innovation Hackathon",
    event: "StartupTN Tourism Innovation Hackathon",
    organization: "StartupTN",
    date: "2026-01-19",
    year: "2026",
    category: "OTHER RECOGNITION",
    result: "Advanced to next-round pitch stage",
    contribution: "Pitch-ready prototype advanced through the selection stage.",
    imagePath: "/startuptn,jpeg.jpeg",
    imagePath2: "/startuptn_product.jpeg",
    evidenceAlt:
      "StartupTN Tourism Innovation Hackathon invitation letter issued to Praveen Kumar S",
    evidenceAlt2:
      "StartupTN Tourism Innovation Hackathon prototype presented by Praveen Kumar S",
    featured: true,
    tier: 2,
  },

  {
    id: "iiit-sricity-research-hackathon",
    title: "3rd Place — IIIT Sri City Research Hackathon",
    event: "Research Hackathon",
    organization: "IIIT Sri City",
    date: "2026-03-28",
    year: "2026",
    category: "RESEARCH",
    result: "3rd Place · ₹3,500 · Solo",
    contribution: "Solo entry. 3rd place in a research-focused hackathon.",
    imagePath: "/iit_sriccity.jpeg",
    evidenceAlt:
      "IIIT Sri City Research Hackathon 3rd place certificate issued to Praveen Kumar S",
    featured: true,
    tier: 2,
  },

  // ── TIER 3: Merit / Regional ──────────────────────────────────────────

  {
    id: "intelliconz-2k25",
    title: "CryptoFort Analysis — Intelliconz 2K25",
    event: "Intelliconz 2K25",
    organization: "Panimalar Engineering College",
    date: "2025-02-22",
    year: "2025",
    category: "OTHER RECOGNITION",
    result: "Competed in CryptoFort Analysis event",
    contribution: "Presented a technical analysis in the CryptoFort track.",
    imagePath: "/Panimalar_intelliconz.jpeg",
    evidenceAlt:
      "Intelliconz 2K25 CryptoFort Analysis participation certificate for Praveen Kumar S",
    featured: false,
    tier: 3,
  },

  {
    id: "data-analysis-st-joseph",
    title: "1st Place — Data Analysis",
    event: "Data Analysis Competition",
    organization: "St. Joseph College of Engineering",
    date: null,
    year: "Date not established",
    category: "WINS",
    result: "1st Place",
    contribution: "Won the data analysis track.",
    imagePath: "/data_analysis.jpeg",
    evidenceAlt:
      "Data Analysis competition 1st place result issued to Praveen Kumar S",
    featured: false,
    tier: 3,
  },

  {
    id: "agni-project-presentation",
    title: "3rd Place — Project Presentation",
    event: "Project Presentation",
    organization: "Agni College of Technology",
    date: "2025-04-05",
    year: "2025",
    category: "PRESENTATIONS",
    result: "3rd Place",
    contribution: "3rd place in project presentation event.",
    imagePath: "/agni_clg.jpeg",
    evidenceAlt:
      "Agni College of Technology project presentation 3rd place result for Praveen Kumar S",
    featured: false,
    tier: 3,
  },

  {
    id: "rmd-project-presentation",
    title: "3rd Place — Project Presentation",
    event: "Project Presentation",
    organization: "RMD College of Engineering",
    date: "2025-03-17",
    year: "2025",
    category: "PRESENTATIONS",
    result: "3rd Place",
    contribution: "3rd place in project presentation event.",
    imagePath: "/rmk_clg.jpeg",
    evidenceAlt:
      "RMD College of Engineering project presentation 3rd place result for Praveen Kumar S",
    featured: false,
    tier: 3,
  },

  {
    id: "cipt-paper-presentation",
    title: "2nd Place — Paper Presentation",
    event: "Paper Presentation — Among 56 Teams",
    organization: "Central Institute of Petroleum Technology",
    date: "2024-10-24",
    year: "2024",
    category: "PRESENTATIONS",
    result: "2nd Place · Solo · Among 56 teams",
    contribution: "2nd place among 56 teams in solo paper presentation.",
    featured: false,
    tier: 3,
  },
];

/**
 * Prize amount exactly as written in `result`, or undefined when no prize is attached.
 * Never formatted, converted or invented.
 */
export function prizeOf(achievement: Achievement): string | undefined {
  return achievement.result.match(/₹[\d,]+(?:,\d{3})*/)?.[0] ?? undefined;
}

/** The featured homepage highlights — ordered by portfolio display priority. */
export const featuredAchievements = achievements.filter((a) => a.featured);

/** All tier-1 champions. */
export const champions = achievements.filter((a) => a.tier === 1);

/** All tier-2 finalists. */
export const finalists = achievements.filter((a) => a.tier === 2);

/** All tier-3 merit records. */
export const meritRecords = achievements.filter((a) => a.tier === 3);
