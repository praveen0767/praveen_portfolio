export type AchievementCategory = "HACKATHON" | "TECHNICAL CHALLENGE" | "COMPETITION" | "NATIONAL RECOGNITION" | "INDUSTRY CHALLENGE" | "PROJECT EXHIBITION" | "CERTIFICATION";

export type Achievement = {
  id: string;
  title: string;
  event: string;
  organization: string;
  year: string;
  category: AchievementCategory;
  result: string;
  contribution: string;
  project?: string;
  evidenceUrl?: string;
  certificateUrl?: string;
  featured: boolean;
  tier: 1 | 2 | 3;
};

export const achievements: Achievement[] = [
  { id: "samantha-25-champion", title: "Champion - SAMARTHA'25 National Hackathon", event: "SAMARTHA'25 National Hackathon", organization: "SAMARTHA", year: "2025", category: "HACKATHON", result: "Winner · INR 1.5L prize", contribution: "Competitive project execution.", featured: true, tier: 1 },
  { id: "nalsar-ai-trading-challenge", title: "Solo Champion - NALSAR University AI Trading Challenge", event: "AI Trading Challenge", organization: "NALSAR University", year: "Not specified", category: "TECHNICAL CHALLENGE", result: "Winner · INR 30K prize", contribution: "Competitive project execution.", featured: true, tier: 1 },
  { id: "volkswagen-imobilothon", title: "Top 10 National Finalist - Volkswagen i-Mobilothon 5.0 Recruitment Hackathon", event: "Volkswagen i-Mobilothon 5.0 Recruitment Hackathon", organization: "Volkswagen", year: "Not specified", category: "HACKATHON", result: "Top 10 National Finalist", contribution: "Competitive project execution.", featured: true, tier: 2 },
  { id: "intellismart-instinct", title: "Top 10 National Finalist - IntelliSmart INSTINCT National Hackathon", event: "INSTINCT National Hackathon", organization: "IntelliSmart", year: "Not specified", category: "NATIONAL RECOGNITION", result: "Top 10 National Finalist", contribution: "Competitive project execution.", featured: true, tier: 2 },
  { id: "isma-sugarnxt", title: "Top 10 National Finalist - ISMA SugarNXT National Hackathon", event: "SugarNXT National Hackathon", organization: "ISMA", year: "Not specified", category: "NATIONAL RECOGNITION", result: "Top 10 National Finalist", contribution: "Competitive project execution.", featured: true, tier: 2 },
  { id: "bank-of-baroda-hackathon", title: "National Finalist - Bank of Baroda National Hackathon", event: "National Hackathon", organization: "Bank of Baroda", year: "Not specified", category: "NATIONAL RECOGNITION", result: "National Finalist", contribution: "Competitive project execution.", featured: true, tier: 3 },
  { id: "tamil-nadu-tourism-startup-challenge", title: "Top 30 Finalist - Tamil Nadu Tourism Startup Challenge", event: "Tamil Nadu Tourism Startup Challenge", organization: "StartupTN", year: "Not specified", category: "INDUSTRY CHALLENGE", result: "Top 30 Finalist", contribution: "Competitive project execution.", featured: false, tier: 3 },
  { id: "nptel-human-computer-interaction", title: "NPTEL - Human-Computer Interaction", event: "Human-Computer Interaction", organization: "NPTEL", year: "Not specified", category: "CERTIFICATION", result: "Certification", contribution: "Course completed.", featured: false, tier: 3 },
];
