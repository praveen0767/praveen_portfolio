import { Hero } from "./Hero";
import { HeroHandoff } from "./HeroHandoff";
import { ArivSection } from "./ariv/ArivSection";
import { FeaturedWork } from "./FeaturedWork";
import { TechToolkit } from "./TechToolkit";
import { EngineeringPulse } from "./EngineeringPulse";
import { JourneyTimeline } from "./JourneyTimeline";
import { ProofWall } from "./ProofWall";
import { AboutStrip } from "./AboutStrip";
import { ContactCta } from "./ContactCta";

/**
 * The homepage is a sentence, and the order of the sections is the grammar:
 *
 *   me                      Hero            identity, portrait, work / resume / socials
 *   ↓                       HeroHandoff     particles fall and converge on the first node
 *   what I built            ArivSection     project 01, the flagship, 8-stage control plane
 *   ↓ what else I built     FeaturedWork    projects 02 / 03 / 04
 *   what I build with       TechToolkit     the toolkit, filterable, with where it is used
 *   how I think             EngineeringPulse the loop and the default call on a problem
 *   my journey              JourneyTimeline where I got here
 *   my proof                ProofWall       what is on record
 *   me                      AboutStrip      the person, again
 *                           ContactCta      the close
 *
 * The seven-layer FDE capability system is presented once, inside the Hero desk
 * (DeveloperDesk), where it belongs. A second standalone copy used to render
 * here after FeaturedWork; it repeated the same seven layers, the same
 * technologies and the same project relationships, so it was removed rather
 * than restyled.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <HeroHandoff />
      <ArivSection />
      <FeaturedWork />
      <TechToolkit />
      <EngineeringPulse />
      <JourneyTimeline />
      <ProofWall />
      <AboutStrip />
      <ContactCta />
    </>
  );
}
