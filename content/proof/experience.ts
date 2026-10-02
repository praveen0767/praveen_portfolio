export type Experience = {
  id: string;
  organization: string;
  role: string;
  period: string;
  type: string;
  location?: string;
  summary: string;
  responsibilities: string[];
  engineering: string[];
  technologies: string[];
  outcomes: string[];
  relatedProjects?: string[];
};

export const experiences: Experience[] = [
  {
    id: "billionbright-ai-application-development-intern",
    organization: "BillionBright Solutions LLP",
    role: "AI & Application Development Intern",
    period: "June 2025 - August 2025",
    type: "PAID INTERNSHIP",
    location: "Remote",
    summary: "Developed real-time application workflows integrating generative AI models into product-facing systems.",
    responsibilities: ["Worked on reliable model integration and application-level functionality.", "Worked across model enhancement, integration, and deployment pipelines."],
    engineering: ["Built and automated Stable Diffusion, LoRA, and Fooocus workflows.", "Integrated generative AI models into real-time application workflows."],
    technologies: ["Stable Diffusion", "LoRA", "Fooocus"],
    outcomes: ["Contributed to model enhancement, integration, and deployment workflows."],
  },
];
