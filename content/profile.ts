export type ContactChannel = {
  label: string;
  description: string;
  href: string;
  external: boolean;
};

export const profile = {
  name: "Praveen Kumar S",
  wordmark: "PRAVEEN.KUMAR",
  professionalTitle: "Software Engineer",
  secondaryTitle: "AI Generalist · AI Systems Builder",
  /** Lines used as the hero headline, kept short and editable in one place. */
  headline: ["I build software", "systems that solve", "real problems."],
  heroStatement:
    "I design and build end-to-end systems across software, data and artificial intelligence — from problem definition and architecture through implementation, evaluation and deployment.",
  shortBio: "Software engineer building practical systems across software, data, and artificial intelligence.",
  longBio:
    "Praveen Kumar S is a software engineer in training focused on practical systems that combine strong software foundations with data and artificial intelligence.",
  location: "Chennai, Tamil Nadu",
  education: "Bachelor of Technology in Artificial Intelligence and Data Science",
  institution: "Sri Sairam Institute of Technology",
  educationPeriod: "September 2023 - May 2027",
  cgpa: "7.17 / 10",
  portraitPath: "/portrait/praveen.png",
  resumePath: "/Praveen_Resume.pdf",
  resumeLabel: "Praveen_Resume.pdf",
  email: "praveensrinivasan05@gmail.com",
  linkedin: "https://www.linkedin.com/in/praveen-kumar-srinivasan-9b6737280/",
  github: "https://github.com/praveen0767/",
  /** Used by the footer and structured data so the year is never hard coded twice. */
  copyrightYear: new Date().getFullYear(),
} as const;

export const contactChannels: ContactChannel[] = [
  {
    label: "Email",
    description: profile.email,
    href: `mailto:${profile.email}`,
    external: false,
  },
  {
    label: "LinkedIn",
    description: "Professional profile",
    href: profile.linkedin,
    external: true,
  },
  {
    label: "GitHub",
    description: "Code and repositories",
    href: profile.github,
    external: true,
  },
];

export const aboutPrinciples = [
  "Start with the problem.",
  "Make trade-offs explicit.",
  "Prefer the simplest solution that works.",
  "Use AI when it creates leverage.",
];