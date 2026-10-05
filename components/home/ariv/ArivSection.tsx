import { Section } from "../../layout/Section";
import { Reveal } from "../../ui/Reveal";
import { TechChip } from "../../ui/TechLogo";
import { LinkButton } from "../../ui/Button";
import { TiltCard } from "../../motion/TiltCard";
import { Parallax } from "../../motion/Parallax";
import { Magnetic } from "../../motion/Magnetic";
import { ProjectMark } from "../../ui/ProjectMark";
import { ArivSystem } from "./ArivSystem";
import { arivAuthorityModel, arivInvariant, arivRepository, arivStages } from "../../../content/ariv";
import { getProject } from "../../../content/projects";

/**
 * Project 01 — the flagship.
 *
 * This is the first artifact after the hero and it is sized like one: the copy
 * column and the control-plane canvas share a full-width stage, and the two
 * repository invariants sit underneath as the argument the system is making.
 */
export function ArivSection() {
  const project = getProject("ariv-agentic-revenue-recovery");

  if (!project) return null;

  return (
    <Section
      id="ariv"
      className="ariv"
      eyebrow={`Selected work \u00b7 ${project.number}`}
      heading={project.title}
      lede="An agentic revenue-recovery control plane for Razorpay. AI agents diagnose a failure and propose recovery, the economic layer ranks the candidates, a deterministic PolicyEngine authorizes, a leased worker executes durably, and Razorpay is the only thing that decides whether revenue was actually recovered."
      aside={
        <div className="ariv__badges">
          <span className="ariv__badge ariv__badge--flagship">
            <span className="pulse-dot" aria-hidden="true" />
            Flagship
          </span>
          <span className="ariv__badge">{project.status}</span>
          <span className="ariv__badge">{project.category}</span>
          <span className="ariv__badge">{project.year}</span>
        </div>
      }
    >
      <div className="ariv__stage">
        {/* ── Copy column ─────────────────────────────────────────── */}
        <div className="ariv__intro">
          <p className="ariv__kicker">
            {arivStages.length}-stage control plane · {project.role}
          </p>

          <div className="ariv__headline-wrap">
            <ProjectMark slug={project.slug} title={project.title} size={36} strong />
            <h3 className="ariv__headline">Agentic payment recovery</h3>
          </div>

          <p className="ariv__desc">{project.shortDescription}</p>

          {/* The eight-stage spine lives in the control plane on the right —
              showing the same eight names twice in one frame reads as a
              duplicate list, not as a system. */}

          <ul className="project__stack ariv__stack">
            {project.technologies.map((tech) => (
              <li key={tech}>
                <TechChip name={tech} size={14} />
              </li>
            ))}
          </ul>

          <div className="ariv__ctas">
            <Magnetic>
              <LinkButton href={`/work/${project.slug}`} className="btn--lg btn--primary-glow">
                Open case study
                <span className="btn__arrow" aria-hidden="true">
                  →
                </span>
              </LinkButton>
            </Magnetic>
            <Magnetic>
              <LinkButton href={arivRepository} target="_blank" variant="outline" className="btn--lg">
                View GitHub
                <span className="btn__arrow" aria-hidden="true">
                  ↗
                </span>
              </LinkButton>
            </Magnetic>
          </div>
        </div>

        {/* ── Flagship canvas ─────────────────────────────────────── */}
        <div className="ariv__visual">
          <span className="ariv__visual-label">Control plane · live</span>
          <Parallax className="ariv__visual-depth" distance={16}>
            <TiltCard className="ariv__visual-tilt" strength={2} lift={7}>
              <ArivSystem />
            </TiltCard>
          </Parallax>
        </div>
      </div>

      {/* ── The invariant, stated by the repository ──────────────── */}
      <Reveal className="ariv__invariant">
        <p className="ariv__invariant-label">The key invariant</p>
        <p className="ariv__invariant-chain">
          <span>{arivInvariant.a}</span>
          <span className="ariv__invariant-ne" aria-hidden="true">
            ≠
          </span>
          <span>{arivInvariant.b}</span>
          <span className="ariv__invariant-ne" aria-hidden="true">
            ≠
          </span>
          <span>{arivInvariant.c}</span>
        </p>
        <p className="ariv__invariant-note">
          Revenue is counted only after provider-confirmed payment and recovery attribution. That is why the
          benchmark cohorts below report zero recovered revenue instead of converting successful actions into a
          financial outcome.
        </p>
      </Reveal>

      {/* ── Authority chain ──────────────────────────────────────── */}
      <Reveal className="ariv__authority">
        <p className="ariv__authority-label">The authority model</p>
        <ol className="ariv__authority-list">
          {arivAuthorityModel.map((entry, index) => (
            <li key={entry.role} className="ariv__authority-item" data-index={index}>
              <span className="ariv__authority-role">{entry.role}</span>
              <span className="ariv__authority-action">{entry.action}</span>
            </li>
          ))}
        </ol>
        <p className="ariv__authority-note">
          No LLM is granted direct authority to move money. Every financial action is decided by a deterministic
          PolicyEngine, executed through a governed tool runtime, and only confirmed by Razorpay.
        </p>
      </Reveal>
    </Section>
  );
}
