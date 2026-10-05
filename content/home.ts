export type Capability = {
  id: "software" | "ai" | "data" | "product";
  label: string;
  summary: string;
  items: string[];
  accent: "electric" | "violet" | "cyan" | "lime";
};

export type ProcessStage = {
  number: string;
  label: string;
  description: string;
};

export type FdeStep = {
  number: string;
  label: string;
  description: string;
};

/** The FDE operating model: the conceptual backbone of the portfolio.
     Each step is a truthful, generic statement — never a corporate process
     diagram. The arrows make the forward direction obvious. */
export type Decision = {
  problem: string;
  approach: string;
};




/**
 * Single source of truth for capability modules.
 * The hero system map pillars are derived from the first three entries so the
 * hero can never drift away from the capability section.
 */
export const capabilities: Capability[] = [
  {
    id: "software",
    label: "Software systems",
    summary:
      "Backend services, APIs, web applications and databases designed to keep working after the demo.",
    items: ["Backend", "APIs", "Web applications", "Databases", "Integrations"],
    accent: "electric",
  },
  {
    id: "ai",
    label: "AI systems",
    summary:
      "Applied machine learning and generative systems, evaluated rather than decorated.",
    items: ["Machine learning", "LLMs", "RAG", "Agents", "Multimodal AI"],
    accent: "violet",
  },
  {
    id: "data",
    label: "Data systems",
    summary:
      "Retrieval, storage and pipelines that keep evidence connected to the answers a system gives.",
    items: ["SQL", "Retrieval", "Vector search", "Data pipelines", "Graph systems"],
    accent: "cyan",
  },
  {
    id: "product",
    label: "End-to-end products",
    summary:
      "Interface, backend, data and deployment shipped as one system with one owner.",
    items: ["Frontend", "Backend", "AI", "Data", "Deployment"],
    accent: "lime",
  },
];

export const heroPillars = capabilities.filter((capability) =>
  ["software", "ai", "data"].includes(capability.id),
);

export const fdeSteps: FdeStep[] = [
  {
    number: "01",
    label: "Discover",
    description:
      "Understand the workflow and actual constraints before choosing a solution.",
  },
  {
    number: "02",
    label: "Scope",
    description:
      "Turn ambiguity into a concrete technical plan.",
  },
  {
    number: "03",
    label: "Build",
    description:
      "Prototype the smallest useful system that validates the approach.",
  },
  {
    number: "04",
    label: "Integrate",
    description:
      "Connect APIs, data and existing infrastructure.",
  },
  {
    number: "05",
    label: "Deploy",
    description:
      "Ship into a real execution environment.",
  },
  {
    number: "06",
    label: "Evaluate",
    description:
      "Measure whether the system actually works.",
  },  {
    number: "07",
    label: "Iterate",
    description: "Feed learnings back into the solution.",
  },
];


export const processStages: ProcessStage[] = [
  {
    number: "01",
    label: "Understand",
    description:
      "Clarify the problem, the users, the constraints and what done actually means.",
  },
  {
    number: "02",
    label: "Architect",
    description:
      "Choose components, interfaces and data flows before the cost of changing them is high.",
  },
  {
    number: "03",
    label: "Build",
    description:
      "Ship the smallest implementation that proves the architecture instead of assuming it.",
  },
  {
    number: "04",
    label: "Evaluate",
    description:
      "Test software behaviour, then measure AI output quality, grounding and retrieval.",
  },
  {
    number: "05",
    label: "Deploy",
    description:
      "Move to a real environment, instrument it, and let usage surface real problems.",
  },
  {
    number: "06",
    label: "Iterate",
    description:
      "Use evidence from use and failure to change the next version deliberately.",
  },
];

export const decisions: Decision[] = [
  { problem: "Simple deterministic problem", approach: "Traditional software" },
  { problem: "Structured data", approach: "Database / query" },
  { problem: "Prediction problem", approach: "Machine learning" },
  { problem: "Unstructured knowledge", approach: "Retrieval / LLM" },  { problem: "Complex multi-step workflow", approach: "Agentic architecture" },
];
