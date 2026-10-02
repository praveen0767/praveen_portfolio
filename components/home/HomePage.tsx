import { Hero } from "./Hero";
import { FeaturedWork } from "./FeaturedWork";
import { EngineeringLoop } from "./EngineeringLoop";
import { Capabilities } from "./Capabilities";
import { CareerTimeline } from "./CareerTimeline";
import { TechToolkit } from "./TechToolkit";
import { ProofPreview } from "./ProofPreview";
import { LabPreview } from "./LabPreview";
import { ContactCta } from "./ContactCta";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { decisions } from "../../content/home";
import { profile } from "../../content/profile";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedWork />

      <Section
        id="how-i-build"
        eyebrow="02 / Engineering"
        heading="Understand the system before writing the feature."
        lede="Every project here runs through the same six stages. Hover or focus a stage to see what happens in it."
      >
        <EngineeringLoop />

        <div className="decisions">
          <h3 className="decisions__title">Choosing the right tool for the problem</h3>
          <ul className="decisions__grid">
            {decisions.map((decision) => (
              <li key={decision.problem} className="decisions__row">
                <span className="decisions__problem">{decision.problem}</span>
                <span className="decisions__arrow" aria-hidden="true">
                  →
                </span>
                <span className="decisions__approach">{decision.approach}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        tone="gradient"
        eyebrow="03 / Capability"
        heading="Four ways I contribute to a product."
        lede="Not tools for their own sake — capability is how the layers of a system get built and kept alive."
      >
        <Capabilities />
      </Section>

      <Section
        id="journey"
        tone="light"
        eyebrow="04 / Journey"
        heading="Engineering is built in sequences, not leaps."
        lede="Education, a hands-on internship, and projects that keep getting more demanding."
      >
        <CareerTimeline />
      </Section>

      <Section
        id="toolkit"
        eyebrow="05 / Toolkit"
        heading="The stack behind the work."
        lede="Every technology here is one I have actually used. Filter by category, or select one to see where it shows up."
      >
        <TechToolkit />
      </Section>

      <Section
        id="proof"
        tone="gradient"
        eyebrow="06 / Proof"
        heading="Competition results where the systems were built under pressure."
        lede="National-level innovation challenges, shipped with a team against a fixed deadline."
      >
        <ProofPreview />
      </Section>

      <Section
        tone="light"
        eyebrow="07 / Lab"
        heading="Work in progress, published honestly."
        lede="Experiments, engineering notes and a build log. Empty shelves stay empty until there is something worth reading."
      >
        <LabPreview />
      </Section>

      <Section tone="dark" id="contact" eyebrow="08 / Contact" className="section--contact">
        <ContactCta />
      </Section>

      <div className="signature" aria-hidden="true">
        <Container>
          <span className="signature__text">{profile.name}</span>
          <span className="signature__line" />
        </Container>
      </div>
    </>
  );
}