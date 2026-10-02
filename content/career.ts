export type CareerEventType = "EDUCATION" | "EXPERIENCE" | "PROJECT" | "MILESTONE";
export type CareerEventPriority = "small" | "medium" | "large";

export type CareerEvent = {
  id: string;
  year: string;
  date?: string;
  type: CareerEventType;
  title: string;
  organization?: string;
  description: string;
  relatedProjects?: string[];
  priority: CareerEventPriority;
};

export const careerEvents: CareerEvent[] = [
  {
    id: "btech-ai-ds",
    year: "2023",
    date: "2023-2027",
    type: "EDUCATION",
    title: "B.Tech Artificial Intelligence and Data Science",
    organization: "Sri Sairam Institute of Technology",
    description: "Started formal engineering journey with AI foundation.",
    priority: "small",
  },
  {
    id: "intern-billionbright",
    year: "2025",
    date: "June 2025 - August 2025",
    type: "EXPERIENCE",
    title: "AI & Application Development Intern",
    organization: "BillionBright Solutions LLP",
    description: "Applied AI models into practical applications.",
    priority: "medium",
  },
  {
    id: "hazard-det",
    year: "2025",
    date: "November 2025",
    type: "PROJECT",
    title: "Hazard Det",
    description: "Engineered an edge AI system for road intelligence.",
    relatedProjects: ["hazard-det-road-intelligence-system"],
    priority: "medium",
  },
  {
    id: "info-i",
    year: "2026",
    date: "January 2026",
    type: "PROJECT",
    title: "Info-i (VeriTrust Agent)",
    description: "Designed a multimodal verification pipeline architecture.",
    relatedProjects: ["info-i-veritrust-agent"],
    priority: "large",
  },
  {
    id: "sodhanegpt",
    year: "2026",
    date: "July 2026",
    type: "PROJECT",
    title: "SodhaneGPT",
    description: "Built a full-stack intelligence platform for crime data.",
    relatedProjects: ["sodhanegpt-crime-intelligence-platform"],
    priority: "large",
  }
];
