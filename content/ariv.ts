/**
 * ARIV — the control plane, expressed as data.
 *
 * Everything in this file is taken from the repository itself: the control-plane
 * flow in the README, the Mermaid architecture diagram, the decisioning layer
 * table, and the measurement sections. Nothing is invented here, and no number
 * appears that is not committed to the repository.
 *
 * The homepage renders this as a scroll-driven system visual, so the node names,
 * the wire order and the stage order have to match the repository exactly — if
 * the architecture changes, this file changes with it.
 */

export type ArivNodeKind =
  /** Provider-owned truth. Razorpay decides, not ARIV. */
  | "provider"
  /** Ingested, verified event state. */
  | "event"
  /** Agentic reasoning. Proposes only. */
  | "reason"
  /** Deterministic authorization and tool control. */
  | "gate"
  /** Durable execution machinery. */
  | "durable"
  /** Measurement and semantic memory. */
  | "measure"
  /** Terminal stop state — the explicit human / kill-switch path. */
  | "stop";

export type ArivNode = {
  id: string;
  /** Short label that fits on the node plate. */
  label: string;
  /** Full component name, used for the accessible description. */
  full: string;
  kind: ArivNodeKind;
};

export type ArivSidecar = {
  id: string;
  label: string;
  full: string;
  /** Node id the sidecar branches from. */
  from: string;
  kind: ArivNodeKind;
};

export type ArivStage = {
  /** Two-digit stage index, matching the scroll order. */
  index: string;
  /** Short stage title shown in the stage rail. */
  title: string;
  /** The stage heading, phrased as the question the stage answers. */
  label: string;
  /** What actually happens in this stage. */
  body: string;
  /** What leaves this stage and enters the next one. */
  handsOff: string;
  nodes: ArivNode[];
  sidecar?: ArivSidecar;
};

/**
 * The eight stages the homepage walks through, in control-plane order.
 *
 * `nodes` are laid out on one horizontal band each, in flow order, so the
 * reading order top-to-bottom is the execution order.
 */
export const arivStages: ArivStage[] = [
  {
    index: "01",
    title: "Failure",
    label: "Problem / payment failure",
    body:
      "A Razorpay payment fails. The webhook is HMAC-SHA256 verified, the raw event is persisted as an authoritative ProviderEvent, and a Recovery Case is opened with a gap matrix and an SLA. Nothing is retried yet.",
    handsOff: "Recovery Case",
    nodes: [
      { id: "event", label: "Razorpay Failure", full: "Razorpay failure event", kind: "provider" },
      { id: "verify", label: "Webhook Verify", full: "Webhook verification", kind: "event" },
      { id: "provider-event", label: "ProviderEvent", full: "ProviderEvent persistence", kind: "event" },
      { id: "case", label: "Recovery Case", full: "Recovery Case", kind: "event" },
    ],
  },
  {
    index: "02",
    title: "Diagnose",
    label: "Agent diagnosis",
    body:
      "Failure intelligence normalizes the failure into a recovery-relevant category. Systemic route intelligence looks for provider degradation, method-specific failure clusters and dead rails instead of the individual payment. Qdrant supplies tenant-isolated semantic precedents, and the result is a decision context.",
    handsOff: "Decision Context",
    nodes: [
      { id: "failure-intel", label: "Failure Intel", full: "Failure intelligence", kind: "reason" },
      { id: "route-intel", label: "Route Intel", full: "Systemic route intelligence", kind: "reason" },
      { id: "memory", label: "Qdrant Memory", full: "Qdrant semantic memory", kind: "measure" },
      { id: "context", label: "Decision Context", full: "Decision Context", kind: "reason" },
    ],
  },
  {
    index: "03",
    title: "Propose",
    label: "Recovery proposal",
    body:
      "The agentic decision engine diagnoses the failure and emits a typed decision proposal. A candidate generator turns it into concrete candidates — retry now, generate a payment link, wait, or stop — with no authority attached to any of them.",
    handsOff: "Typed Decision Proposal",
    nodes: [
      { id: "engine", label: "Agentic Engine", full: "AI / agentic decision engine", kind: "reason" },
      { id: "proposal", label: "Decision Proposal", full: "Typed decision proposal", kind: "reason" },
      { id: "candidates", label: "Candidates", full: "Candidate generator", kind: "reason" },
    ],
  },
  {
    index: "04",
    title: "Rank",
    label: "Economic ranking",
    body:
      "The Economic Optimizer scores every candidate with Expected Net Recovery — P(recovery) × amount − cost − risk — and picks between RECOVER, WAIT, ESCALATE and STOP. Model confidence is explicitly not treated as recovery probability.",
    handsOff: "Ranked candidate set",
    nodes: [
      { id: "enr", label: "ENR", full: "Expected Net Recovery", kind: "reason" },
      { id: "optimizer", label: "Economic Optimizer", full: "Economic Optimizer", kind: "gate" },
    ],
  },
  {
    index: "05",
    title: "Authorize",
    label: "Policy engine",
    body:
      "A deterministic PolicyEngine authorizes the financial action. Approved work goes through the MCPToolGateway — tool registry, input schema validation, tenant and case ownership, server-side risk classification, policy revalidation — and rejected work terminates at an explicit stop.",
    handsOff: "Approved action",
    nodes: [
      { id: "policy", label: "PolicyEngine", full: "Deterministic PolicyEngine", kind: "gate" },
      { id: "execution-control", label: "ExecutionControl", full: "ExecutionControl", kind: "durable" },
      { id: "mcp", label: "MCPToolGateway", full: "MCPToolGateway", kind: "gate" },
    ],
    sidecar: {
      id: "stop-recovery",
      label: "STOP_RECOVERY",
      full: "Stop recovery — rejected, killed or escalated",
      from: "policy",
      kind: "stop",
    },
  },
  {
    index: "06",
    title: "Execute",
    label: "Durable execution",
    body:
      "ExecutionControl writes the authorized action to a transactional outbox. An 18-point preflight gate clears it, and a leased worker with idempotent execution drives the Razorpay adapter. A crash mid-flight cannot double-spend the action or lose it.",
    handsOff: "Provider request",
    nodes: [
      { id: "outbox", label: "Transactional Outbox", full: "Transactional outbox", kind: "durable" },
      { id: "preflight", label: "Preflight Gate", full: "18-point preflight gate", kind: "durable" },
      { id: "worker", label: "Execution Worker", full: "Execution worker with leases", kind: "durable" },
      { id: "adapter", label: "Razorpay Adapter", full: "Razorpay adapter", kind: "durable" },
    ],
  },
  {
    index: "07",
    title: "Confirm",
    label: "Provider-confirmed attribution",
    body:
      "The Razorpay API is the authority. Provider reconciliation turns the provider response into a recovery outcome, and attribution is only recorded after that confirmation — so an action that succeeded is never silently upgraded into recovered revenue.",
    handsOff: "Confirmed outcome",
    nodes: [
      { id: "razorpay", label: "Razorpay API", full: "Razorpay API", kind: "provider" },
      { id: "reconcile", label: "Reconciliation", full: "Provider reconciliation", kind: "measure" },
      { id: "outcome", label: "Recovery Outcome", full: "Recovery outcome", kind: "measure" },
      { id: "attribution", label: "Attribution", full: "Recovery attribution", kind: "measure" },
    ],
  },
  {
    index: "08",
    title: "Measure",
    label: "Measurement",
    body:
      "Recovery measurement produces the number that is allowed to count as revenue. A knowledge outbox writes verified outcomes back into Qdrant, so semantic memory only ever learns from outcomes the provider confirmed. That closes the loop the system was designed around.",
    handsOff: "Verified outcome memory",
    nodes: [
      { id: "measurement", label: "Measurement", full: "Recovery measurement", kind: "measure" },
      { id: "knowledge-outbox", label: "Knowledge Outbox", full: "Knowledge outbox", kind: "measure" },
      { id: "closed-loop", label: "Semantic Memory", full: "Qdrant semantic recovery memory", kind: "measure" },
    ],
  },
];

/** The repository's stated invariant, kept verbatim in meaning. */
export const arivInvariant = {
  a: "Action success",
  b: "Payment success",
  c: "Attributed recovery",
};

/**
 * The authority chain, exactly as the repository states it: AI proposes, the
 * economic layer ranks, PolicyEngine authorizes, and Razorpay confirms.
 */
export const arivAuthority = [
  { role: "AI", action: "Proposes" },
  { role: "Economic", action: "Ranks" },
  { role: "PolicyEngine", action: "Authorizes" },
  { role: "Razorpay", action: "Confirms" },
];

/**
 * The full 6-stage authority model:
 * AI proposes -> Economic Engine ranks -> PolicyEngine authorizes ->
 * Tool Runtime executes -> Razorpay confirms -> Measurement verifies.
 */
export const arivAuthorityModel = [
  { role: "AI", action: "Proposes" },
  { role: "Economic Engine", action: "Ranks" },
  { role: "PolicyEngine", action: "Authorizes" },
  { role: "Tool Runtime", action: "Executes" },
  { role: "Razorpay", action: "Confirms" },
  { role: "Measurement", action: "Verifies" },
];

/** Failure taxonomy the system normalizes into, used as the closing proof strip. */
export const arivFailureTaxonomy = [
  "TRANSIENT_TECHNICAL",
  "CUSTOMER_ACTION_REQUIRED",
  "PAYMENT_METHOD_PROBLEM",
  "PROVIDER_DEGRADATION",
  "MERCHANT_CONFIGURATION",
  "RISK_OR_FRAUD",
  "NON_RETRIABLE",
  "UNKNOWN",
];

/** Repository headline, used verbatim as the flagship description. */
export const arivRepository = "https://github.com/praveen0767/ARIV";

export const arivRepositoryDescription =
  "Agentic payment recovery for Razorpay Test Mode. AI agents diagnose failures and propose recovery \u2192 economic ranking \u2192 deterministic PolicyEngine \u2192 durable execution \u2192 provider-confirmed attribution. Honest benchmarks, stopping rules, and recovery measurement.";
