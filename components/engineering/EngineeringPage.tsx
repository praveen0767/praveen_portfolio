import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { LinkButton } from "../ui/Button";
import {
  decisionRules,
  depthMatrix,
  developingTopics,
  engineeringLoop,
  principles,
  questions,
} from "../../content/engineering";
import { orderedProjects } from "../../content/projects";

export function EngineeringPage() {
  const projectTitles = new Map(orderedProjects().map((project) => [project.slug, project.title]));
  const projectRef = (slug: string) => projectTitles.get(slug);

  return (
    <>
      <Section
        tone="dark"
        eyebrow="Engineering"
        heading="How I turn an ambiguous problem into a system that holds up."
        lede="The same loop shows up in every project here: narrow the problem, design the boundaries, build the smallest thing that proves the architecture, then measure it."
        aside={
          <LinkButton href="/work" variant="quiet">
            See it applied
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </LinkButton>
        }
      >
        <ol className="flow">
          {engineeringLoop.map((stage) => (
            <Reveal as="li" key={stage.number} delay={Number(stage.number) * 40}>
              <article className="flow__stage">
                <span className="flow__number">{stage.number}</span>
                <h3 className="flow__title">{stage.title}</h3>
                <p className="flow__body">{stage.body}</p>
              </article>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section
        tone="light"
        eyebrow="Judgment"
        heading="Choosing the right tool for the problem in front of me."
        lede="AI is one option among several, and it is a bad default. These are the rules I actually apply."
      >
        <div className="judgment">
          <ul className="judgment__list">
            {decisionRules.map((rule) => (
              <li key={rule.problem} className="judgment__row">
                <span className="judgment__problem">{rule.problem}</span>
                <span className="judgment__arrow" aria-hidden="true">
                  →
                </span>
                <span className="judgment__approach">{rule.approach}</span>
              </li>
            ))}
          </ul>

          <div className="judgment__questions">
            <h3 className="judgment__subtitle">Questions asked before building</h3>
            <ul className="judgment__question-list">
              {questions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Principles"
        heading="Eight principles I hold myself to."
        lede="Not slogans — each one has cost me something at least once."
      >
        <ol className="principles">
          {principles.map((principle) => (
            <Reveal as="li" key={principle.number} delay={Number(principle.number) * 30}>
              <span className="principles__number">{principle.number}</span>
              <span className="principles__text">{principle.title}</span>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section
        tone="light"
        eyebrow="Depth"
        heading="Where the depth is, and where I am still building it."
        lede="Demonstrated means a project on this site exercises it. Developing means I am working on it deliberately."
      >
        <div className="depth">
          <ul className="depth__matrix">
            {depthMatrix.map(([area, evidence]) => (
              <li key={area} className="depth__row" data-developing={evidence.startsWith("Developing") ? "true" : undefined}>
                <span className="depth__area">{area}</span>
                <span className="depth__evidence">{evidence}</span>
              </li>
            ))}
          </ul>

          <div className="depth__next">
            <span className="depth__next-label">Developing next</span>
            <ul className="chip-list">
              {developingTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
            <p className="depth__note">
              The projects currently on the site:{" "}
              {[...projectTitles.values()].join(", ")}.
            </p>
            <p className="depth__note">
              {projectRef("sodhanegpt-crime-intelligence-platform")} carries the heaviest software and data
              load. {projectRef("info-i-veritrust-agent")} carries the retrieval and agent work.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="dark" eyebrow="Apply it" heading="The loop, applied to real systems.">
        <div className="engineering-closing">
          <p>
            Reading the architecture is one thing. Reading the decisions, the trade-offs and the parts that did not
            work is where the engineering becomes visible.
          </p>
          <LinkButton href="/work">
            Open the work archive
            <span className="btn__arrow" aria-hidden="true">
              →
            </span>
          </LinkButton>
        </div>
      </Section>
    </>
  );
}