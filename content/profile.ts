export type ContactChannel = {
  /** Stable key so the icon set and the social dock can never drift apart. */
  id: SocialId;
  label: string;
  description: string;
  href: string;
  external: boolean;
};

export type SocialId = "github" | "linkedin" | "whatsapp" | "instagram" | "email";

export const profile = {
  name: "Praveen Kumar S",
  firstName: "Praveen",
  wordmark: "PRAVEEN.KUMAR",
  /** Handle used by the terminal widget and the dock. Not a social account. */
  handle: "praveenkumar",
  professionalTitle: "Forward Deployed Engineer Candidate",
  secondaryTitle:
    "Software Engineer · AI Engineer · AI Systems Builder · Forward Deployed Engineer",
  /** Small identity tags. */
  roles: [
    "Software Engineer",
    "AI Engineer",
    "AI Systems Builder",
    "Forward Deployed Engineer",
  ],
  greeting: "Hey, I'm",
  /** Lines used as the hero headline, kept short and editable in one place. */
  headline: ["Hey, I'm Praveen.", "I build and integrate software,", "AI and data systems around real-world problems."],
  claim: "I build and integrate software, AI and data systems around real-world problems.",
  claimAccent: "real-world problems",
  /** Rotating word strip in the hero. Describes the work, not the person. */
  rotatingWords: ["AI", "SOFTWARE", "DATA", "SYSTEMS"],
  heroStatement:
    "Building toward Forward Deployed Engineering by combining software engineering, AI, data systems, integration, rapid prototyping and deployment-oriented thinking across real-world problems.",
  shortBio:
    "B.Tech student in Chennai. I build full-stack systems where software, data and AI have to work together — and write up what worked, what did not, and why.",
  longBio:
    "Praveen Kumar S is a software engineer in training focused on practical systems that combine strong software foundations with data and artificial intelligence.",
  /** One honest line about what is taking the time right now. */
  statusLine: "Currently building",
  statusDetail: "Software + AI systems, from architecture through evaluation.",
  location: "Chennai, Tamil Nadu",
  /**
   * Hero location line. Deliberately neutral: it makes no availability claim
   * and does not reduce the identity to a single city.
   */
  baseLine: "Based in India · Software × AI × Systems",
  education: "Bachelor of Technology in Artificial Intelligence and Data Science",
  institution: "Sri Sairam Institute of Technology",
  educationPeriod: "September 2023 - May 2027",
  cgpa: "7.17 / 10",
  portraitPath: "/praveen.jpeg",
  resumePath: "/Praveen_Resume.pdf",
  resumeLabel: "Praveen_Resume.pdf",
  email: "praveensrinivasan05@gmail.com",
  /** Prefilled on every mailto so the mail client opens a draft, not a blank. */
  emailSubject: "Portfolio Inquiry",
  linkedin: "https://www.linkedin.com/in/praveen-kumar-srinivasan-9b6737280/",
  github: "https://github.com/praveen0767/",
  /** WhatsApp uses the wa.me short link: no `+` in the path, so it routes. */
  whatsapp: "https://wa.me/917358085171",
  whatsappLabel: "+91 73580 85171",
  instagram: "https://www.instagram.com/praveen.g2t/",
  instagramHandle: "@praveen.g2t",
  /** Used by the footer and structured data so the year is never hard coded twice. */
  copyrightYear: new Date().getFullYear(),
} as const;

export const contactChannels: ContactChannel[] = [
  {
    id: "email",
    label: "Email",
    description: profile.email,
    href: `mailto:${profile.email}?subject=${encodeURIComponent(profile.emailSubject)}`,
    external: false,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: profile.whatsappLabel,
    href: profile.whatsapp,
    external: true,
  },
  {
    id: "instagram",
    label: "Instagram",
    description: profile.instagramHandle,
    href: profile.instagram,
    external: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Professional profile",
    href: profile.linkedin,
    external: true,
  },
  {
    id: "github",
    label: "GitHub",
    description: "Code and repositories",
    href: profile.github,
    external: true,
  },
];

/**
 * The same five channels, in dock order. Derived rather than restated so the
 * hero, the footer and the contact page can never point at different places.
 */
export const socialOrder: SocialId[] = [
  "github",
  "linkedin",
  "whatsapp",
  "instagram",
  "email",
];

export function channelById(id: SocialId): ContactChannel {
  const channel = contactChannels.find((entry) => entry.id === id);
  if (!channel) throw new Error(`unknown contact channel: ${id}`);
  return channel;
}

export const aboutPrinciples = [
  "Start with the problem.",
  "Make trade-offs explicit.",
  "Prefer the simplest solution that works.",
  "Use AI when it creates leverage.",
];

/** Truthful terminal widget copy. Every line maps to a fact elsewhere on the site. */
export const terminalLines: { command: string; output: string }[] = [
  { command: "whoami", output: profile.handle },
  { command: "focus", output: "software + ai systems" },
  { command: "stack", output: "python · fastapi · next.js · pytorch" },
];

export type StoryBlock = { label: string; title: string; body: string };

/**
 * About page content. Written as a personal account rather than a CV summary —
 * every claim traces back to a project, a record or the education entry above.
 */
export const story: StoryBlock[] = [
  {
    label: "Who I am",
    title: "I am the person who owns the whole system.",
    body: "I am a B.Tech student in Artificial Intelligence and Data Science in Chennai. What I like about software is the part after the idea: choosing the boundaries, deciding what should be deterministic, and writing the thing so it still works when the happy path runs out. On this site each project carries its own architecture, its engineering decisions, and what did not work — because that is the part I actually want to be judged on.",
  },
  {
    label: "What I like building",
    title: "Systems where software, data and AI have to cooperate.",
    body: "A multimodal verification pipeline that keeps its evidence traceable. A crime intelligence platform where a risk score has to be explainable to the person reading it. A road intelligence system running inference on a Raspberry Pi instead of a data centre. Different domains, same shape of problem: several layers that only work if the interfaces between them are right.",
  },
  {
    label: "How I think",
    title: "Start with the problem, and make the trade-offs explicit.",
    body: "AI is an option among several, not the default answer. A deterministic rule beats a model when the problem is deterministic. I would rather write the simplest thing that works and be able to say exactly why each part exists. When something fails, that is information about my design, not bad luck.",
  },
  {
    label: "Why I build",
    title: "Because I want to be able to explain every line.",
    body: "I would rather ship three systems I fully understand than ten I half remember. This site is the same instinct applied to the pages: the work, the decisions, the results and the gaps, all in one place, written by the person who built them.",
  },
];

/** Micro labels used across the site. Navigation shorthand, not content. */
export const pathLabels = ["/projects", "/lab", "/build-log"] as const;