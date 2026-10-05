import { Section } from "../layout/Section";
import { Reveal } from "../ui/Reveal";
import { LinkButton } from "../ui/Button";
import { EngineeringFlow } from "../engineering/EngineeringFlow";
import { decisionRules, engineeringLoop, questions } from "../../content/engineering";

/**
 * How I think, on the homepage.
 *
 * The engineering loop is the same interactive rail used on /engineering, so the
 * two can never disagree. The judgement rules underneath it are the part people
 * actually skip on their own site, so they stay here.
 */
export function EngineeringPulse() {
  return (
    <Section
      id="engineering"
      className="eng"
      eyebrow="Engineering"
      heading="How I turn a problem into a system."
      lede={`Eight steps I do not skip, and ${questions.length} questions I ask before writing any of them. The loop is not a philosophy — it is the order the code gets written in.`}
      aside={
        <LinkButton href="/engineering" variant="quiet">
          Engineering page
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </LinkButton>
      }
    >
      <Reveal className="eng__loop">
        <EngineeringFlow />
      </Reveal>

      <Reveal className="eng__judgement" delay={80}>
        <p className="eng__judgement-label">Default call on an unfamiliar problem</p>
        <ol className="eng__rules">
          {decisionRules.map((rule) => (
            <li key={rule.problem} className="eng__rule">
              <span className="eng__rule-problem">{rule.problem}</span>
              <span className="eng__rule-arrow" aria-hidden="true">
                →
              </span>
              <span className="eng__rule-approach">{rule.approach}</span>
            </li>
          ))}
        </ol>
        <p className="eng__judgement-note">
          {engineeringLoop.length} steps, every one of them reversible while it is cheap. The expensive reversals
          are the ones I plan for.
        </p>
      </Reveal>
    </Section>
  );
}
