export type EngineeringFlow = { number: string; title: string; body: string };
export type EngineeringPrinciple = { number: string; title: string };
export type EngineeringDecisionRule = { problem: string; approach: string };

export const engineeringLoop: EngineeringFlow[] = [
  { number: "01", title: "Understand", body: "Clarify the user, requirements, constraints, data, failure conditions, and definition of success." },
  { number: "02", title: "Decompose", body: "Turn an ambiguous problem into smaller responsibilities, interfaces, data flows, and failure states." },
  { number: "03", title: "Design", body: "Choose an architecture and boundaries before implementation becomes expensive to change." },
  { number: "04", title: "Build", body: "Start with the smallest useful implementation that can validate the architecture." },
  { number: "05", title: "Test", body: "Check correctness, edge cases, integrations, failures, and output quality where relevant." },
  { number: "06", title: "Evaluate", body: "Measure whether the system solves the original problem, not merely whether it produces output." },
  { number: "07", title: "Deploy", body: "Move from local software toward a usable system with the operational context it needs." },
  { number: "08", title: "Iterate", body: "Treat the first architecture as a hypothesis and use evidence to improve the next version." },
];

export const principles: EngineeringPrinciple[] = [
  { number: "01", title: "Start with the problem, not the technology." },
  { number: "02", title: "Prefer simple systems when simple systems are sufficient." },
  { number: "03", title: "Make important trade-offs explicit." },
  { number: "04", title: "Measure before optimizing." },
  { number: "05", title: "Treat failure as an engineering signal." },
  { number: "06", title: "AI should improve the system, not decorate it." },
  { number: "07", title: "Design for the user, not only the architecture diagram." },
  { number: "08", title: "A working prototype is the beginning of engineering, not the end." },
];

export const decisionRules: EngineeringDecisionRule[] = [
  { problem: "Deterministic problem", approach: "Traditional software" },
  { problem: "Structured data", approach: "Database / query" },
  { problem: "Prediction", approach: "Machine learning" },
  { problem: "Unstructured knowledge", approach: "Retrieval / LLM" },
  { problem: "Complex multi-step workflow", approach: "Agentic system" },
];

export const questions = [
  "What problem are we actually solving?",
  "What does success look like?",
  "What are the constraints?",
  "What happens when the system fails?",
  "What data do we have?",
  "Where does state live?",
  "What should be deterministic?",
  "Does this really need AI?",
  "How will we measure whether it works?",
];

export const depthMatrix = [
  ["Software Engineering", "Demonstrated in SodhaneGPT and Info-i."],
  ["Backend", "Demonstrated in SodhaneGPT and Info-i."],
  ["Frontend", "Demonstrated in SodhaneGPT."],
  ["AI / ML", "Demonstrated in Hazard Det and SodhaneGPT."],
  ["Data", "Demonstrated in SodhaneGPT and Info-i."],
  ["Infrastructure", "Demonstrated in Hazard Det (RabbitMQ, Edge)."],
  ["System Design", "Developing depth."],
];

export const developingTopics = ["System Design", "Distributed Systems", "Cloud Engineering", "AI Evaluation", "Production AI", "MLOps"];
