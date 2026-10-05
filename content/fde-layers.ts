export type Layer = {
  id: string;
  index: string;
  label: string;
  /** Spans the full graph width; sits between the two-column pairs. */
  span: boolean;
  note: string;
  techs: string[];
};

export const LAYERS: Layer[] = [
  {
    id: "problem",
    index: "01",
    label: "Problem",
    span: true,
    note: "Find the real constraint before reaching for a tool.",
    techs: [],
  },
  {
    id: "software",
    index: "02",
    label: "Software",
    span: false,
    note: "Typed services and interfaces that stay maintainable.",
    techs: ["Python", "TypeScript", "JavaScript", "FastAPI", "Next.js", "React"],
  },
  {
    id: "ai-systems",
    index: "03",
    label: "AI Systems",
    span: false,
    note: "Retrieval, orchestration and vision pipelines.",
    techs: ["LangGraph", "RAG", "PyTorch", "YOLOv8", "OpenCV"],
  },
  {
    id: "data",
    index: "04",
    label: "Data",
    span: true,
    note: "Relational state, vector search and tabular preparation.",
    techs: ["PostgreSQL", "MySQL", "Redis", "Qdrant", "Pandas", "NumPy"],
  },
  {
    id: "integration",
    index: "05",
    label: "Integration",
    span: false,
    note: "The contracts between services, queues and clients.",
    techs: ["REST APIs", "RabbitMQ"],
  },
  {
    id: "infra",
    index: "06",
    label: "Infrastructure",
    span: false,
    note: "Reproducible environments, from container to edge device.",
    techs: ["Docker", "Linux", "Raspberry Pi", "Cloud", "CI/CD"],
  },
  {
    id: "evaluation",
    index: "07",
    label: "Evaluation",
    span: true,
    note: "Measure the system, not only the model.",
    techs: ["Observability", "Evaluation", "Tracing", "Reliability", "Monitoring"],
  },
];
