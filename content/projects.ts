export type ProjectCategory = "SOFTWARE" | "AI SYSTEM" | "DATA" | "FULL-STACK" | "EXPERIMENT";
export type ProjectStatus = "RESEARCH" | "PROTOTYPE" | "DEMO" | "DEPLOYED" | "ARCHIVED";
/** Presentation-only accents. They describe how a project is drawn, not what it is. */
export type ProjectAccent = "electric" | "violet" | "cyan" | "lime" | "orange" | "pink";
/** Presentation-only diagram layouts used by the SVG project visual. */
export type ProjectDiagram = "vertical" | "horizontal" | "merge";

export type ProjectSection = { title: string; body: string; items?: string[] };
export type ArchitectureStep = { number: string; title: string; description: string };
export type EngineeringDecision = { decision: string; reason: string; alternative: string; tradeoff: string };
export type Project = {
  slug: string;
  number: string;
  title: string;
  shortDescription: string;
  category: ProjectCategory;
  year: string;
  status: ProjectStatus;
  role?: string;
  technologies: string[];
  featured: boolean;
  priority: number;
  verified: boolean;
  accent: ProjectAccent;
  diagram: ProjectDiagram;
  problem: ProjectSection;
  context: ProjectSection;
  requirements: { functional: string[]; technical: string[] };
  constraints: string[];
  architecture: ArchitectureStep[];
  engineeringDecisions: EngineeringDecision[];
  softwareLayer: string[];
  aiLayer?: string[];
  dataLayer?: string[];
  implementation: ProjectSection[];
  validation: ProjectSection;
  evaluation: ProjectSection;
  results: ProjectSection;
  failures: ProjectSection;
  lessons: string[];
  futureWork: string[];
  githubUrl?: string;
  liveUrl?: string;
};


export const projects: Project[] = [
  {
    slug: "info-i-veritrust-agent",
    number: "01",
    title: "Info-i (VeriTrust Agent)",
    shortDescription: "A multimodal verification pipeline for text, image, and audio inputs using evidence-grounded retrieval.",
    category: "AI SYSTEM",
    year: "January 2026",
    status: "PROTOTYPE",
    role: "Architecture and development",
    technologies: ["Python", "Qdrant", "FastAPI", "LangGraph", "RAG"],
    featured: true,
    priority: 1,
    verified: true,
    accent: "electric",
    diagram: "vertical",
    problem: { title: "The Problem", body: "Verification across text, image, and audio inputs requires multiple processing paths and evidence that can be traced back to a claim." },
    context: { title: "Context", body: "Info-i (VeriTrust Agent) was engineered as a multimodal verification pipeline combining extraction, retrieval, orchestration, and human review." },
    requirements: { functional: ["Accept text, image, and audio inputs", "Retrieve evidence for claims", "Support confidence-based human review"], technical: ["Generate embeddings", "Filter retrieval by metadata", "Maintain persistent claim memory"] },
    constraints: ["Multimodal input handling", "Evidence traceability", "Human review for uncertain claims"],
    architecture: [
      { number: "01", title: "Input", description: "Text, image, and audio inputs enter the verification pipeline." },
      { number: "02", title: "OCR / ASR", description: "Optical character recognition and automatic speech recognition extract usable content." },
      { number: "03", title: "Retrieval", description: "Qdrant-backed hybrid retrieval finds relevant evidence with metadata filtering." },
      { number: "04", title: "Agent", description: "LangGraph orchestrates verification steps and maintains claim memory." },
      { number: "05", title: "Review", description: "Confidence-based human review handles uncertain results." },
    ],
    engineeringDecisions: [
      {
        decision: "Used Qdrant for hybrid retrieval",
        reason: "Needed efficient vector and keyword search for multimodal evidence",
        alternative: "Separate vector and keyword stores",
        tradeoff: "Increased system complexity vs unified retrieval"
      },
      {
        decision: "Implemented persistent claim memory",
        reason: "Needed to track verification context across processing steps",
        alternative: "Stateless processing with repeated context passage",
        tradeoff: "Memory overhead vs context preservation"
      },
      {
        decision: "Agent-based orchestration with LangGraph",
        reason: "Complex verification workflow required conditional logic and state management",
        alternative: "Linear pipeline or hardcoded workflow logic",
        tradeoff: "Development complexity vs workflow flexibility"
      },
      {
        decision: "Metadata filtering in retrieval",
        reason: "Needed to scope evidence to relevant documents and reduce noise",
        alternative: "Post-filtering of retrieval results",
        tradeoff: "Retrieval complexity vs result precision"
      },
      {
        decision: "Confidence-based human review",
        reason: "Automated verification benefits from human oversight on uncertain results",
        alternative: "Fully automated or fully manual review",
        tradeoff: "Review latency vs verification accuracy"
      }
    ],
    softwareLayer: ["FastAPI service", "Pipeline orchestration", "Confidence-based review workflow"],
    aiLayer: ["Embedding generation", "OCR / ASR processing", "RAG", "LangGraph agent orchestration"],
    dataLayer: ["Qdrant-backed hybrid retrieval", "Persistent claim memory", "Metadata filtering"],
    implementation: [{ title: "Implementation", body: "Built a FastAPI service orchestrating multimodal verification through OCR/ASR processing, embedding generation, Qdrant-backed retrieval, and LangGraph agent workflow with confidence-based human review." }],
    validation: { title: "Validation", body: "The build was validated against the constraints the system was designed around: multimodal input handling, evidence traceability, and human review for uncertain claims." },
    evaluation: { title: "Evaluation", body: "This project is at prototype stage. A claim is only useful if the retrieved evidence supports it, so verification quality is judged on evidence support and on whether uncertain claims reach the review path instead of being asserted." },
    results: { title: "Results", body: "Engineered a multimodal verification pipeline processing text, image, and audio inputs with evidence-grounded RAG and confidence-based human review." },
    failures: { title: "What did not work", body: "No critical failures have been recorded for this project." },
    lessons: [],
    futureWork: [],
  },
  {
    slug: "sodhanegpt-crime-intelligence-platform",
    number: "02",
    title: "SodhaneGPT - Crime Intelligence Platform",
    shortDescription: "An end-to-end platform combining structured data ingestion, geospatial analytics, graph intelligence, predictive risk scoring, and explainable ML services.",
    category: "FULL-STACK",
    year: "July 2026",
    status: "PROTOTYPE",
    role: "Architecture and development",
    technologies: ["Next.js", "XGBoost", "Python", "FastAPI", "PostgreSQL", "Tailwind CSS"],
    featured: true,
    priority: 2,
    verified: true,
    accent: "violet",
    diagram: "horizontal",
    problem: { title: "The Problem", body: "Crime intelligence workflows can require structured ingestion, geospatial analysis, graph relationships, risk scoring, and explainable services in one system." },
    context: { title: "Context", body: "SodhaneGPT was engineered as an end-to-end crime intelligence platform using modular pipelines and model-serving APIs." },
    requirements: { functional: ["Ingest structured data", "Support geospatial and graph analysis", "Serve predictive risk scoring and explanations"], technical: ["Validate schemas", "Build features for inference", "Support 100K+ record workloads"] },
    constraints: ["100K+ record workloads", "Schema validation", "Explainable model services"],
    architecture: [
      { number: "01", title: "Ingestion", description: "Modular pipelines ingest structured records with schema validation." },
      { number: "02", title: "Features", description: "Feature engineering prepares data for inference workflows." },
      { number: "03", title: "Intelligence", description: "Graph-based entity analysis and geospatial analytics add system context." },
      { number: "04", title: "Serving", description: "Model-serving APIs expose predictive risk scoring and explainable ML services." },
      { number: "05", title: "Application", description: "A Next.js application presents the platform workflow." },
    ],
    engineeringDecisions: [
      {
        decision: "Modular data pipelines with schema validation",
        reason: "Needed reliable ingestion of diverse structured data sources",
        alternative: "Monolithic ingestion logic or no validation",
        tradeoff: "Development overhead vs data reliability"
      },
      {
        decision: "Separate inference pipeline from serving APIs",
        reason: "Required independent scaling of ML compute and API traffic",
        alternative: "Tightly coupled inference and serving",
        tradeoff: "System complexity vs operational flexibility"
      },
      {
        decision: "Graph-based entity analysis with NetworkX",
        reason: "Needed to uncover relationships between crime events and entities",
        alternative: "Relational joins or no relationship analysis",
        tradeoff: "Compute overhead vs investigative insights"
      },
      {
        decision: "XGBoost for predictive risk scoring",
        reason: "Required explainable, high-performance tabular prediction",
        alternative: "Neural networks or simpler linear models",
        tradeoff: "Training complexity vs prediction accuracy"
      },
      {
        decision: "Explainable ML services via SHAP/LIME",
        reason: "Stakeholders required understanding of risk factor contributions",
        alternative: "Black box models or post-hoc explanations",
        tradeoff: "Implementation effort vs transparency"
      }
    ],
    softwareLayer: ["Next.js application", "FastAPI model-serving APIs", "Modular ingestion pipelines", "Schema validation"],
    aiLayer: ["XGBoost predictive risk scoring", "Explainable ML services"],
    dataLayer: ["Structured data ingestion", "Feature engineering", "Geospatial analytics", "Graph-based entity analysis", "100K+ record workloads"],
    implementation: [{ title: "Implementation", body: "Built an end-to-end platform with modular data pipelines for structured ingestion, feature engineering, XGBoost-based risk scoring with explainability, and graph-based entity analysis, served through FastAPI APIs and consumed by a Next.js application." }],
    validation: { title: "Validation", body: "The platform was validated against its stated constraints: 100K+ record workloads, schema validation, and explainable model services." },
    evaluation: { title: "Evaluation", body: "This project is at prototype stage. Risk scoring is only trusted if a reviewer can see which factors drove each score, so explainability is treated as part of the model surface rather than a report added later." },
    results: { title: "Results", body: "Engineered an end-to-end crime intelligence platform integrating structured data ingestion, geospatial analytics, graph intelligence, predictive risk scoring, and explainable ML services." },
    failures: { title: "What did not work", body: "No critical failures have been recorded for this project." },
    lessons: [],
    futureWork: [],
  },
  {
    slug: "hazard-det-road-intelligence-system",
    number: "03",
    title: "Hazard Det - Road Intelligence System",
    shortDescription: "An edge-AI road intelligence system combining object detection, sensor fusion, telemetry, and edge-side privacy processing.",
    category: "AI SYSTEM",
    year: "November 2025",
    status: "PROTOTYPE",
    role: "Architecture and development",
    technologies: ["Python", "YOLOv8", "OpenCV", "RabbitMQ", "Raspberry Pi"],
    featured: true,
    priority: 3,
    verified: true,
    accent: "cyan",
    diagram: "merge",
    problem: { title: "The Problem", body: "Road intelligence at the edge requires inference, sensor data, vehicle telemetry, event transport, geospatial analysis, and privacy processing to work together." },
    context: { title: "Context", body: "Hazard Det was built as an edge-AI road intelligence system using Raspberry Pi hardware and an asynchronous edge-to-cloud pipeline." },
    requirements: { functional: ["Detect road hazards", "Fuse GPS/IMU sensor data", "Produce structured hazard events"], technical: ["Run inference at the edge", "Transport events asynchronously", "Process privacy-sensitive data at the edge"] },
    constraints: ["Edge computing", "Asynchronous event delivery", "Privacy processing at the edge"],
    architecture: [
      { number: "01", title: "Edge input", description: "Raspberry Pi receives camera and vehicle sensor signals." },
      { number: "02", title: "Inference", description: "YOLOv8 and OpenCV process road imagery at the edge." },
      { number: "03", title: "Fusion", description: "GPS/IMU sensor fusion and CAN-bus telemetry enrich detections." },
      { number: "04", title: "Transport", description: "RabbitMQ / CloudAMQP carries structured hazard events asynchronously." },
      { number: "05", title: "Analytics", description: "Real-time geospatial analytics operate on the resulting event stream." },
    ],
    engineeringDecisions: [
      {
        decision: "Asynchronous edge-to-cloud pipeline with RabbitMQ",
        reason: "Needed reliable event transport despite intermittent connectivity",
        alternative: "Synchronous HTTP polling or direct cloud writes",
        tradeoff: "Infrastructure complexity vs reliability"
      },
      {
        decision: "YOLOv8 for road hazard detection",
        reason: "Required real-time object detection on edge hardware",
        alternative: "Earlier YOLO versions or custom CNN",
        tradeoff: "Model size vs detection accuracy"
      },
      {
        decision: "GPS/IMU sensor fusion for enriched detections",
        reason: "Needed spatiotemporal context for hazard classification",
        alternative: "Camera-only detection or post-processing fusion",
        tradeoff: "Hardware complexity vs detection context"
      },
      {
        decision: "CAN-bus telemetry integration",
        reason: "Required vehicle state correlation with visual detections",
        alternative: "Visual-only hazard assessment or separate telemetry",
        tradeoff: "Integration effort vs contextual accuracy"
      },
      {
        decision: "Edge-side privacy processing for GDPR compliance",
        reason: "Needed to protect visual privacy before cloud transmission",
        alternative: "Cloud-side processing or no privacy measures",
        tradeoff: "Compute overhead vs privacy protection"
      }
    ],
    softwareLayer: ["Asynchronous edge-to-cloud pipeline", "Structured hazard events", "RabbitMQ event transport"],
    aiLayer: ["YOLOv8 inference", "OpenCV image processing"],
    dataLayer: ["GPS/IMU sensor fusion", "CAN-bus telemetry", "Real-time geospatial analytics"],
    implementation: [{ title: "Implementation", body: "Built an edge-AI system on Raspberry Pi combining YOLOv8 hazard detection, GPS/IMU sensor fusion, CAN-bus telemetry, and edge-side privacy processing, with asynchronous RabbitMQ-based event transport to cloud analytics." }],
    validation: { title: "Validation", body: "The system was validated against its stated constraints: edge computing, asynchronous event delivery, and privacy processing at the edge." },
    evaluation: { title: "Evaluation", body: "This project is at prototype stage. A hazard detection is only useful on a real road if it arrives with the sensor context needed to act on it, so evaluation covers detection together with the enriched event that leaves the device." },
    results: { title: "Results", body: "Built an edge-AI road intelligence system integrating YOLOv8 inference with GPS/IMU sensor fusion, CAN-bus telemetry, and edge-side privacy processing." },
    failures: { title: "What did not work", body: "No critical failures have been recorded for this project." },
    lessons: [],
    futureWork: [],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

/** Projects ordered the way they are presented everywhere in the UI. */
export function orderedProjects() {
  return [...projects].sort((a, b) => a.priority - b.priority);
}

export function featuredProjects() {
  return orderedProjects().filter((project) => project.featured);
}

export function adjacentProjects(project: Project) {
  const ordered = orderedProjects();
  const index = ordered.findIndex((entry) => entry.slug === project.slug);
  return {
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}

/** Category values that actually have projects behind them. */
export function activeProjectCategories() {
  const seen = new Set(projects.map((project) => project.category));
  return [...seen];
}
