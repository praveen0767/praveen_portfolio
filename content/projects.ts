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


/**
 * Project 01 — ARIV.
 *
 * Every statement below is taken from the repository itself: the README, the
 * benchmark reports committed under `artifacts/benchmarks`, and the offline
 * ablation results. Nothing here is inferred, rounded up, or extrapolated, and
 * the sections that would normally hold marketing numbers (results, evaluation)
 * deliberately hold the zero-recovery results instead.
 */
const ariv: Project = {
  slug: "ariv-agentic-revenue-recovery",
  number: "01",
  title: "ARIV — Agentic Revenue Recovery for Razorpay",
  shortDescription:
    "Agentic payment recovery for Razorpay Test Mode. AI agents diagnose failures and propose recovery \u2192 economic ranking \u2192 deterministic PolicyEngine \u2192 durable execution \u2192 provider-confirmed attribution. Honest benchmarks, stopping rules, and recovery measurement.",
  category: "AI SYSTEM",
  year: "September 2026",
  status: "PROTOTYPE",
  role: "Architecture and development",
  technologies: ["Python", "FastAPI", "PostgreSQL", "Qdrant", "Next.js", "Docker"],
  featured: true,
  priority: 1,
  verified: true,
  accent: "electric",
  diagram: "vertical",
  problem: {
    title: "The Problem",
    body:
      "Recover failed payments intelligently instead of blindly retrying everything. A failed payment is not automatically a retry candidate, and an action that succeeds is not automatically recovered revenue.",
  },
  context: {
    title: "Context",
    body:
      "ARIV is an agentic revenue-recovery control plane for Razorpay, built as a buildathon submission and evaluated against the real Razorpay Test Mode API. Because a student project does not operate on a production merchant payment stream, the evaluation deliberately separates pipeline validation, real provider execution validation, and complete customer-paid recovery validation.",
  },
  requirements: {
    functional: [
      "Verify and persist Razorpay webhook events",
      "Create a recovery case with a gap matrix and SLA",
      "Propose, rank and authorize recovery actions per case",
      "Execute approved actions durably through a worker",
      "Attribute and measure recovery only after provider confirmation",
    ],
    technical: [
      "HMAC-SHA256 webhook verification",
      "Deterministic authorization of every financial action",
      "Transactional outbox with worker leases and idempotent execution",
      "Tenant-isolated semantic retrieval of past outcomes",
      "Provider reconciliation before any recovery is counted",
    ],
  },
  constraints: [
    "Razorpay Test Mode only \u2014 no production money recovery rate is claimed",
    "No LLM is granted direct authority to move money",
    "Benchmark actions are never counted as recovered revenue without Razorpay confirmation",
    "Modelled offline results stay separate from provider-confirmed outcomes",
  ],
  architecture: [
    { number: "01", title: "Ingest & case", description: "Razorpay events are webhook-verified, persisted as authoritative ProviderEvents, and opened as Recovery Cases." },
    { number: "02", title: "Intelligence & memory", description: "Failure intelligence and systemic route intelligence build the decision context, backed by Qdrant semantic memory." },
    { number: "03", title: "Decision & economics", description: "The agentic decision engine emits a typed proposal; candidates are ranked by the Economic Optimizer using ENR." },
    { number: "04", title: "Policy + MCP control", description: "A deterministic PolicyEngine approves or rejects; the MCPToolGateway controls which tools may run." },
    { number: "05", title: "Durable execution", description: "ExecutionControl writes to a transactional outbox, an 18-point preflight gate clears it, and a leased worker executes." },
    { number: "06", title: "Provider truth", description: "The Razorpay adapter runs the provider call, then reconciliation turns the response into a Recovery Outcome." },
    { number: "07", title: "Attribution + measurement", description: "Recovery is attributed and measured, then a knowledge outbox writes verified outcomes back to semantic memory." },
    { number: "08", title: "Operator experience", description: "An operator dashboard, ASK ARIV conversational control and Telegram alerts sit on top of the same measured state." },
  ],
  engineeringDecisions: [
    {
      decision: "Let the PolicyEngine authorize, never the model",
      reason: "Financial operations need a deterministic decision that can be audited and reproduced",
      alternative: "Letting the agent choose and execute the recovery action directly",
      tradeoff: "A deterministic gate that can refuse a recovery the model wanted",
    },
    {
      decision: "Rank candidates with Expected Net Recovery instead of retry-everything",
      reason: "P(recovery) \u00d7 amount \u2212 cost \u2212 risk separates worth attempting from worth ignoring",
      alternative: "Blind retry on every failure, or ranking on model confidence",
      tradeoff: "Recovery probability has to be estimated, and AI confidence is explicitly not treated as recovery probability",
    },
    {
      decision: "Make the MCP layer a real tool runtime, not a model-to-provider bridge",
      reason: "Financial operations must stay behind deterministic execution controls",
      alternative: "Letting the model call provider tools with its own arguments",
      tradeoff: "Tool registry, schema validation, tenant ownership and server-side risk classification on every call",
    },
    {
      decision: "Execute through a transactional outbox with worker leases",
      reason: "An approved action must survive a crash without being executed twice",
      alternative: "Calling the provider inside the request that approved the action",
      tradeoff: "An extra persistence hop and a worker to operate, in exchange for idempotency",
    },
    {
      decision: "Attribute recovery only after Razorpay confirms the payment",
      reason: "Counting an attempted recovery as recovered revenue would be a fabricated financial outcome",
      alternative: "Reporting successful execution attempts as recovery",
      tradeoff: "The reported recovery rate stays at zero for cohorts that never completed a customer payment",
    },
    {
      decision: "Keep a deterministic fallback when the LLM is unavailable",
      reason: "The pipeline must still reach a decision without depending on a model being reachable",
      alternative: "Failing the case or retrying until the model responds",
      tradeoff: "The deterministic path is less capable than the agentic path",
    },
  ],
  softwareLayer: [
    "FastAPI service with SQLAlchemy 2 async",
    "Deterministic PolicyEngine and ExecutionControl",
    "Transactional outbox, worker leases and idempotent execution",
    "Next.js operator dashboard and ASK ARIV conversational control",
  ],
  aiLayer: [
    "Agentic failure diagnosis and typed decision proposals",
    "Failure intelligence and systemic route intelligence",
    "Systemic signal detection for dead payment rails",
  ],
  dataLayer: [
    "PostgreSQL authoritative operational state",
    "Redis queue and coordination",
    "Qdrant tenant-isolated semantic recovery memory",
    "Provider-confirmed attribution ledger",
  ],
  implementation: [
    {
      title: "Implementation",
      body:
        "Built the control plane as a FastAPI service over PostgreSQL, Redis and Qdrant: webhook ingestion into ProviderEvents, Recovery Cases, agentic diagnosis, ENR ranking, the deterministic PolicyEngine, the MCPToolGateway, the outbox and execution worker, the Razorpay adapter, reconciliation, attribution, measurement and a knowledge outbox back into semantic memory. A Next.js frontend provides the operator dashboard.",
    },
    {
      title: "Running it",
      body:
        "The whole stack comes up with docker compose. One command, `python scripts/run_test_recovery.py --amount 100`, drives the existing pipeline end to end through a real signed webhook and prints the case, decision, economic ranking, policy result and the Razorpay Test-Mode payment link.",
    },
  ],
  validation: {
    title: "Validation",
    body:
      "The repository reports 302 tests passing with 0 failed, and 100% decision coverage in both reported Test-Mode benchmark cohorts. Benchmarks are produced by sending generated failure events through the real webhook ingestion path and computing metrics from persisted database state \u2014 there is no direct outcome injection and no policy bypass.",
  },
  evaluation: {
    title: "Evaluation",
    body:
      "Benchmark A (execution scale): 25 cases, \u20b935,232.60 at risk, 25/25 decisioned, 25 execution attempts, 24 provider payment-link actions, 1 real Razorpay failure (RATE_LIMIT_EXCEEDED), 0 verified recoveries, 0% recovery rate. Benchmark B (scenario diversity): 18 cases, \u20b9145,400 at risk, 18/18 decisioned, 4 RETRY_NOW, 5 GENERATE_PAYMENT_LINK, 9 STOP_RECOVERY, 16/2 policy approved-to-review, 16 FULL_AUTO / 2 HUMAN_APPROVAL, 5 executions, 0 execution failures, 2 human escalations, 0 verified recoveries. An offline ablation over 10 seeds \u00d7 10,000 synthetic cases found the economic strategy beat rules, but adding AI and adding Qdrant did not improve modelled net recovery, and the full stack did not outperform the economic layer alone.",
  },
  results: {
    title: "Results",
    body:
      "Reported separately from the benchmark denominators, ARIV demonstrated one complete customer-paid recovery in Razorpay Test Mode: case ec60fb5d, outcome RECOVERED, attribution ACTION_ATTRIBUTED, \u20b9100 recovered. That proves the end-to-end path from failure to provider-confirmed attribution and is explicitly not presented as a statistically significant recovery-rate experiment.",
  },
  failures: {
    title: "What did not work",
    body:
      "Both benchmark cohorts report 0 verified recoveries, because the cohorts exercised failure \u2192 decision \u2192 policy \u2192 execution but did not include customers subsequently completing every generated recovery link. In the offline ablation, adding AI on top of the economic strategy and adding Qdrant both failed to improve modelled net recovery. Those negative results are left visible rather than reframed.",
  },
  lessons: [
    "Do not give an AI agent unrestricted authority over money.",
    "Do not call an attempted recovery a recovered payment.",
    "AI confidence is not a recovery probability; only the economic layer may rank on probability.",
    "Separating Test-Mode demonstrations from benchmark denominators is what keeps the numbers honest.",
  ],
  futureWork: [
    "Build a properly instrumented experimental environment before making any causal recovery claim",
    "Prove the incremental value of the AI and semantic memory layers on real cases",
  ],
  githubUrl: "https://github.com/praveen0767/ARIV",
};

export const projects: Project[] = [
  ariv,
  {
    slug: "info-i-veritrust-agent",
    number: "02",
    title: "Info-i (VeriTrust Agent)",
    shortDescription: "A multimodal verification pipeline for text, image, and audio inputs using evidence-grounded retrieval.",
    category: "AI SYSTEM",
    year: "January 2026",
    status: "PROTOTYPE",
    role: "Architecture and development",
    technologies: ["Python", "Qdrant", "FastAPI", "LangGraph", "RAG"],
    featured: true,
    priority: 2,
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
    number: "03",
    title: "SodhaneGPT - Crime Intelligence Platform",
    shortDescription: "An end-to-end platform combining structured data ingestion, geospatial analytics, graph intelligence, predictive risk scoring, and explainable ML services.",
    category: "FULL-STACK",
    year: "July 2026",
    status: "PROTOTYPE",
    role: "Architecture and development",
    technologies: ["Next.js", "XGBoost", "Python", "FastAPI", "PostgreSQL", "Tailwind CSS"],
    featured: true,
    priority: 3,
    verified: true,
    accent: "orange",
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
    number: "04",
    title: "Hazard Det - Road Intelligence System",
    shortDescription: "An edge-AI road intelligence system combining object detection, sensor fusion, telemetry, and edge-side privacy processing.",
    category: "AI SYSTEM",
    year: "November 2025",
    status: "PROTOTYPE",
    role: "Architecture and development",
    technologies: ["Python", "YOLOv8", "OpenCV", "RabbitMQ", "Raspberry Pi"],
    featured: true,
    priority: 4,
    verified: true,
    accent: "lime",
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
