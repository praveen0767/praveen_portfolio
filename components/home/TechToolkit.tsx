import { Section } from "../layout/Section";
import { LinkButton } from "../ui/Button";
import { TechPlayground } from "./TechPlayground";
import { technologies } from "../../content/tech";
import { projectTechnologies } from "../../content/tech";

const usedCount = projectTechnologies().length;

/**
 * Section wrapper for the tech playground.
 *
 * The lede is derived from the verified data: how many technologies exist, and
 * how many of them actually appear in a project stack on this site.
 */
export function TechToolkit() {
  return (
    <Section
      id="toolkit"
      eyebrow="Toolbox"
      heading="Tech I actually use, and where it shows up."
      lede={`${technologies.length} technologies in the toolkit. ${usedCount} of them appear in a verified project stack on this site — hover any tile to see the role it plays and the systems it belongs to.`}
      aside={
        <LinkButton href="/work" variant="quiet">
          See the stacks
          <span className="btn__arrow" aria-hidden="true">
            →
          </span>
        </LinkButton>
      }
    >
      <TechPlayground />
    </Section>
  );
}