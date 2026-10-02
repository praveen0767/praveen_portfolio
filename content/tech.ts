import { projects } from "./projects";

export const techCategories = [
  "ALL",
  "LANGUAGES",
  "WEB",
  "BACKEND",
  "AI / ML",
  "GENAI",
  "DATA",
  "INFRA",
  "TOOLS",
] as const;

export type TechCategory = (typeof techCategories)[number];

export type Tech = {
  /** Stable key, also used for lookup and tests. */
  id: string;
  name: string;
  category: Exclude<TechCategory, "ALL">;
  /** Simple Icons slug when a real brand mark exists. */
  logo?: string;
  /** Canonical brand colour taken from the brand's own icon set. */
  hex?: string;
  /** Interactive highlight colour (differs from the mark when a mark is monochrome). */
  accent?: string;
  /** One line explaining how the technology is used. */
  role: string;
};

export const technologies: Tech[] = [
  // ── LANGUAGES ────────────────────────────────────────────────
  {
    id: "python",
    name: "Python",
    category: "LANGUAGES",
    logo: "python",
    hex: "#3776AB",
    accent: "#4B8BBE",
    role: "Primary language for AI services, pipelines, and model code.",
  },
  {
    id: "java",
    name: "Java",
    category: "LANGUAGES",
    logo: "openjdk",
    hex: "#000000",
    accent: "#F89820",
    role: "Backend and application engineering language.",
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "LANGUAGES",
    logo: "javascript",
    hex: "#F7DF1E",
    accent: "#F7DF1E",
    role: "Language behind the web interfaces built alongside backend services.",
  },
  {
    id: "cpp",
    name: "C++",
    category: "LANGUAGES",
    logo: "cplusplus",
    hex: "#00599C",
    accent: "#00599C",
    role: "Systems and performance-oriented programming.",
  },
  {
    id: "sql",
    name: "SQL",
    category: "LANGUAGES",
    hex: "#336791",
    accent: "#336791",
    role: "Querying relational stores for application and analytics workloads.",
  },

  // ── WEB ──────────────────────────────────────────────────────
  {
    id: "nextjs",
    name: "Next.js",
    category: "WEB",
    logo: "nextdotjs",
    hex: "#000000",
    accent: "#E2E8F0",
    role: "Application framework used for product front ends.",
  },
  {
    id: "react",
    name: "React.js",
    category: "WEB",
    logo: "react",
    hex: "#61DAFB",
    accent: "#61DAFB",
    role: "Component model for interactive interfaces.",
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "WEB",
    logo: "tailwindcss",
    hex: "#06B6D4",
    accent: "#06B6D4",
    role: "Utility-first styling for shipped product interfaces.",
  },

  // ── BACKEND ──────────────────────────────────────────────────
  {
    id: "fastapi",
    name: "FastAPI",
    category: "BACKEND",
    logo: "fastapi",
    hex: "#009688",
    accent: "#009688",
    role: "Python API layer serving AI pipelines and model endpoints.",
  },
  {
    id: "nodejs",
    name: "Node.js",
    category: "BACKEND",
    logo: "nodedotjs",
    hex: "#5FA04E",
    accent: "#5FA04E",
    role: "JavaScript runtime for service and integration work.",
  },
  {
    id: "rest",
    name: "REST APIs",
    category: "BACKEND",
    hex: "#2DD4BF",
    accent: "#2DD4BF",
    role: "HTTP contract style used between services and clients.",
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "BACKEND",
    logo: "mysql",
    hex: "#4479A1",
    accent: "#4479A1",
    role: "Relational storage for application data.",
  },

  // ── AI / ML ──────────────────────────────────────────────────
  {
    id: "pytorch",
    name: "PyTorch",
    category: "AI / ML",
    logo: "pytorch",
    hex: "#EE4C2C",
    accent: "#EE4C2C",
    role: "Model development and deep learning experiments.",
  },
  {
    id: "scikit-learn",
    name: "Scikit-learn",
    category: "AI / ML",
    logo: "scikitlearn",
    hex: "#F7931E",
    accent: "#F7931E",
    role: "Classical machine learning for tabular and feature workflows.",
  },
  {
    id: "xgboost",
    name: "XGBoost",
    category: "AI / ML",
    hex: "#22C55E",
    accent: "#22C55E",
    role: "Gradient boosting for explainable tabular risk scoring.",
  },
  {
    id: "yolov8",
    name: "YOLOv8",
    category: "AI / ML",
    logo: "ultralytics",
    hex: "#111F68",
    accent: "#111F68",
    role: "Real-time object detection running on edge hardware.",
  },
  {
    id: "opencv",
    name: "OpenCV",
    category: "AI / ML",
    logo: "opencv",
    hex: "#5C3EE8",
    accent: "#5C3EE8",
    role: "Image processing for captured video frames.",
  },

  // ── GENAI ────────────────────────────────────────────────────
  {
    id: "langgraph",
    name: "LangGraph",
    category: "GENAI",
    logo: "langgraph",
    hex: "#1C3C3C",
    accent: "#7FC8FF",
    role: "Stateful agent orchestration with conditional branching.",
  },
  {
    id: "rag",
    name: "RAG",
    category: "GENAI",
    hex: "#A855F7",
    accent: "#C084FC",
    role: "Evidence-grounded retrieval connected to generation.",
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    category: "GENAI",
    hex: "#F472B6",
    accent: "#F472B6",
    role: "Generative image workflows automated during application work.",
  },
  {
    id: "lora",
    name: "LoRA",
    category: "GENAI",
    hex: "#FB923C",
    accent: "#FB923C",
    role: "Low-rank adaptation for tuning generative image models.",
  },
  {
    id: "fooocus",
    name: "Fooocus",
    category: "GENAI",
    hex: "#818CF8",
    accent: "#818CF8",
    role: "Interface layer used to operate image generation workflows.",
  },

  // ── DATA ─────────────────────────────────────────────────────
  {
    id: "qdrant",
    name: "Qdrant",
    category: "DATA",
    logo: "qdrant",
    hex: "#DC244C",
    accent: "#DC244C",
    role: "Vector store backing hybrid retrieval with metadata filters.",
  },
  {
    id: "faiss",
    name: "FAISS",
    category: "DATA",
    hex: "#38BDF8",
    accent: "#38BDF8",
    role: "Similarity search for embedding experiments.",
  },
  {
    id: "pandas",
    name: "Pandas",
    category: "DATA",
    logo: "pandas",
    hex: "#150458",
    accent: "#3B2A8C",
    role: "Tabular preparation and feature construction.",
  },
  {
    id: "numpy",
    name: "NumPy",
    category: "DATA",
    logo: "numpy",
    hex: "#013243",
    accent: "#4C8FA8",
    role: "Numeric computation underpinning feature pipelines.",
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "DATA",
    logo: "postgresql",
    hex: "#4169E1",
    accent: "#4169E1",
    role: "Relational store for structured intelligence workloads.",
  },
  {
    id: "networkx",
    name: "NetworkX",
    category: "DATA",
    hex: "#F472B6",
    accent: "#F472B6",
    role: "Graph analysis for entity relationships and links.",
  },

  // ── INFRA ────────────────────────────────────────────────────
  {
    id: "rabbitmq",
    name: "RabbitMQ",
    category: "INFRA",
    logo: "rabbitmq",
    hex: "#FF6600",
    accent: "#FF8A3D",
    role: "Message broker carrying events from edge to cloud.",
  },
  {
    id: "docker",
    name: "Docker",
    category: "INFRA",
    logo: "docker",
    hex: "#2496ED",
    accent: "#2496ED",
    role: "Containerised environments for services and experiments.",
  },
  {
    id: "linux",
    name: "Linux",
    category: "INFRA",
    logo: "linux",
    hex: "#FCC624",
    accent: "#FCC624",
    role: "Development and runtime environment for backend work.",
  },
  {
    id: "raspberrypi",
    name: "Raspberry Pi",
    category: "INFRA",
    logo: "raspberrypi",
    hex: "#A22846",
    accent: "#C75163",
    role: "Edge compute board hosting on-device inference.",
  },

  // ── TOOLS ────────────────────────────────────────────────────
  {
    id: "git",
    name: "Git",
    category: "TOOLS",
    logo: "git",
    hex: "#F03C2E",
    accent: "#F03C2E",
    role: "Version control across every project.",
  },
  {
    id: "github",
    name: "GitHub",
    category: "TOOLS",
    logo: "github",
    hex: "#181717",
    accent: "#8B949E",
    role: "Code hosting and review workflow.",
  },
  {
    id: "vscode",
    name: "VS Code",
    category: "TOOLS",
    hex: "#0EA5E9",
    accent: "#0EA5E9",
    role: "Primary editor for day-to-day engineering.",
  },
];

export function getTechnology(name: string) {
  return technologies.find((tech) => tech.name === name);
}

/** Projects that actually reference a technology in their verified stack. */
export function projectsUsing(tech: Tech) {
  return projects.filter((project) => project.technologies.includes(tech.name));
}

export function techCountByCategory(category: TechCategory) {
  if (category === "ALL") return technologies.length;
  return technologies.filter((tech) => tech.category === category).length;
}

/** Only render filters that actually have content behind them. */
export function activeTechCategories(): TechCategory[] {
  return techCategories.filter((category) => techCountByCategory(category) > 0);
}