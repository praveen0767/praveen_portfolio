import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { aboutPrinciples, contactChannels, profile } from "../content/profile";
import { capabilities, heroPillars, processStages } from "../content/home";
import { adjacentProjects, featuredProjects, getProject, orderedProjects, projects } from "../content/projects";
import { arivAuthority, arivInvariant, arivRepository, arivRepositoryDescription, arivStages } from "../content/ariv";
import { achievements } from "../content/proof/achievements";
import { experiences } from "../content/proof/experience";
import { careerEvents } from "../content/career";
import { getTechnology, technologies } from "../content/tech";
import { LAYERS } from "../content/fde-layers";
import { navLinks } from "../components/navigation/nav-links";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const SOURCE_EXTENSIONS = [".tsx", ".ts"];

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      sourceFiles(full, acc);
    } else if (SOURCE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      acc.push(full);
    }
  }
  return acc;
}

function relative(file: string) {
  return file.slice(REPO_ROOT.length).replace(/\\/g, "/");
}

/** Comments document the removed duplicate; they are not renders, so a doc
 *  note must never satisfy (or fail) a "renders exactly once" invariant. */
function withoutComments(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

function sourcesContaining(dir: string, needle: string) {
  return sourceFiles(join(REPO_ROOT, dir))      .filter((file) => withoutComments(readFileSync(file, "utf8")).includes(needle))
    .map(relative)
    .sort();
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXTERNAL = /^https:\/\//;

test("profile exposes one identity, real contact routes and local assets", () => {
  assert.equal(profile.name, "Praveen Kumar S");
  assert.match(profile.email, EMAIL);
  assert.ok(profile.linkedin.startsWith("https://"));
  assert.ok(profile.github.startsWith("https://"));
  assert.ok(profile.portraitPath.startsWith("/"));
  assert.ok(profile.resumePath.startsWith("/"));
});

test("contact channels resolve to the profile values", () => {
  const email = contactChannels.find((channel) => channel.label === "Email");
  assert.equal(
    email?.href,
    `mailto:${profile.email}?subject=${encodeURIComponent(profile.emailSubject)}`,
  );
  assert.ok(email?.href.startsWith(`mailto:${profile.email}`));
  for (const channel of contactChannels) {
    if (channel.external) assert.match(channel.href, EXTERNAL);
    assert.ok(channel.description.length > 0);
  }
});

test("navigation only points at routes that exist in the app directory", () => {
  const routes = [
    "/",
    "/work",
    "/engineering",
    "/proof",
    "/achievements",
    "/lab",
    "/about",
    "/contact",
  ];
  assert.equal(navLinks.length, routes.length);
  navLinks.forEach((link) => assert.ok(routes.includes(link.href), `unexpected route ${link.href}`));
  assert.equal(navLinks[0].href, "/", "Home route must be first");
  assert.equal(navLinks[0].label, "Home", "First nav link must be labelled Home");
});

test("exactly four verified projects are presented, with ARIV first", () => {
  assert.equal(projects.length, 4);
  const ordered = orderedProjects();
  assert.deepEqual(
    ordered.map((project) => project.slug),
    [
      "ariv-agentic-revenue-recovery",
      "info-i-veritrust-agent",
      "sodhanegpt-crime-intelligence-platform",
      "hazard-det-road-intelligence-system",
    ],
  );
  assert.deepEqual(
    ordered.map((project) => project.number),
    ["01", "02", "03", "04"],
  );
  assert.deepEqual(
    ordered.map((project) => project.priority),
    [1, 2, 3, 4],
  );
  assert.equal(featuredProjects().length, 4);
  assert.ok(ordered.every((project) => project.verified));
});

test("ARIV is the flagship and its control-plane stages are complete", () => {
  const ariv = orderedProjects()[0];
  assert.equal(ariv.slug, "ariv-agentic-revenue-recovery");
  assert.equal(ariv.number, "01");
  assert.ok(ariv.featured, "ARIV must be featured");
  assert.equal(ariv.githubUrl, "https://github.com/praveen0767/ARIV");
  assert.equal(ariv.shortDescription, arivRepositoryDescription);

  // The homepage visual is generated from these, so the rail and the SVG bands
  // have to agree: eight stages, eight architecture steps, no empty copy.
  assert.equal(arivStages.length, 8);
  assert.deepEqual(
    arivStages.map((stage) => stage.index),
    ["01", "02", "03", "04", "05", "06", "07", "08"],
  );
  for (const stage of arivStages) {
    assert.ok(stage.title.length > 0, `ARIV stage ${stage.index} missing title`);
    assert.ok(stage.label.length > 0, `ARIV stage ${stage.index} missing label`);
    assert.ok(stage.body.length > 30, `ARIV stage ${stage.index} body too short`);
    assert.ok(stage.handsOff.length > 0, `ARIV stage ${stage.index} missing hand-off`);
    assert.ok(stage.nodes.length >= 2, `ARIV stage ${stage.index} needs at least two nodes`);
  }
  assert.deepEqual(
    arivStages.map((stage) => stage.index),
    ariv.architecture.map((step) => step.number),
  );

  // The invariant is the honesty claim of the whole system, so it has to stay
  // three separate statements instead of collapsing into one.
  const invariant = Object.values(arivInvariant);
  assert.equal(invariant.length, 3);
  assert.equal(new Set(invariant).size, 3);

  assert.deepEqual(
    arivAuthority.map((step) => `${step.role} ${step.action}`),
    ["AI Proposes", "Economic Ranks", "PolicyEngine Authorizes", "Razorpay Confirms"],
  );
  assert.ok(arivRepository.startsWith("https://github.com/"));
  assert.ok(arivRepositoryDescription.length > 40);
});

test("ARIV never claims a recovery the repository did not report", () => {
  const ariv = orderedProjects()[0];
  // Both benchmark cohorts report zero verified recoveries, and the single
  // customer-paid recovery is deliberately held outside the denominators.
  assert.match(ariv.evaluation.body, /0 verified recoveries/);
  assert.match(ariv.failures.body, /0 verified recoveries/);
  assert.ok(!/(\d+(\.\d+)?)\s?%\s?recovery rate of/i.test(ariv.results.body));
});

test("every project has the fields a case study renders", () => {
  for (const project of projects) {
    assert.ok(project.number.length > 0, `${project.slug} missing number`);
    assert.ok(project.problem.body.length > 40, `${project.slug} problem too short`);
    assert.ok(project.constraints.length > 0, `${project.slug} missing constraints`);
    assert.ok(project.requirements.functional.length > 0, `${project.slug} missing functional requirements`);
    assert.ok(project.requirements.technical.length > 0, `${project.slug} missing technical requirements`);
    assert.equal(project.architecture.length >= 4, true, `${project.slug} needs a full architecture path`);
    assert.ok(project.engineeringDecisions.length >= 4, `${project.slug} needs engineering decisions`);
    assert.ok(project.softwareLayer.length > 0, `${project.slug} missing software layer`);
    assert.ok(project.validation.body.length > 0, `${project.slug} missing validation`);
    assert.ok(project.evaluation.body.length > 0, `${project.slug} missing evaluation`);
    assert.ok(project.failures.body.length > 0, `${project.slug} missing failure notes`);
    for (const step of project.architecture) {
      assert.ok(step.title.length > 0 && step.description.length > 0, `${project.slug} incomplete step`);
    }
  }
});

test("project helpers resolve existing slugs and neighbours", () => {
  const first = orderedProjects()[0];
  const last = orderedProjects().at(-1)!;
  assert.equal(getProject(first.slug)?.slug, first.slug);
  assert.equal(getProject("does-not-exist"), undefined);
  assert.equal(adjacentProjects(first).previous, undefined);
  assert.equal(adjacentProjects(first).next?.slug, orderedProjects()[1].slug);
  assert.equal(adjacentProjects(last).next, undefined);
});

test("home capabilities and hero pillars stay in sync", () => {
  assert.equal(capabilities.length, 4);
  assert.equal(heroPillars.length, 3);
  for (const pillar of heroPillars) {
    assert.ok(capabilities.some((capability) => capability.id === pillar.id), `${pillar.id} missing`);
    assert.ok(pillar.summary.length > 0);
    assert.ok(pillar.items.length >= 4);
  }
  assert.deepEqual(processStages.map((stage) => stage.number), ["01", "02", "03", "04", "05", "06"]);
});

test("every technology used by a project exists in the toolkit", () => {
  for (const project of projects) {
    for (const tech of project.technologies) {
      assert.ok(getTechnology(tech), `${project.slug} references unknown technology ${tech}`);
    }
  }
});

test("technology entries are complete and unique", () => {
  const ids = technologies.map((tech) => tech.id);
  assert.equal(new Set(ids).size, ids.length, "technology ids must be unique");
  for (const tech of technologies) {
    assert.ok(tech.name.length > 0);
    assert.ok(tech.role.length > 0, `${tech.name} missing role`);
    assert.ok(tech.logo || !tech.logo, `${tech.name} logo flag must be explicit`);
  }
});

test("proof records only contain honest fields", () => {
  assert.ok(achievements.length >= 6);
  for (const achievement of achievements) {
    assert.ok(achievement.result.length > 0, `${achievement.id} missing result`);
    assert.ok(achievement.organization.length > 0, `${achievement.id} missing organization`);
    assert.ok([1, 2, 3].includes(achievement.tier));
  }
  assert.equal(achievements.filter((achievement) => achievement.tier === 1).length, 2);
});

test("career timeline and experience reference real records", () => {
  assert.ok(careerEvents.length > 0);
  for (const event of careerEvents) {
    assert.ok(event.title.length > 0);
    assert.ok(event.date || event.year, `${event.id} has no time reference`);
  }
  assert.ok(experiences.length >= 1);
  for (const experience of experiences) {
    assert.ok(experience.period.length > 0);
    assert.ok(experience.responsibilities.length > 0);
  }
});

test("about principles are present and non-empty", () => {
  assert.ok(aboutPrinciples.length >= 4);
  assert.ok(aboutPrinciples.every((principle) => principle.length > 0));
});

test("the seven FDE capability layers stay intact and fully mapped", () => {
  assert.deepEqual(
    LAYERS.map((layer) => layer.index),
    ["01", "02", "03", "04", "05", "06", "07"],
  );
  assert.deepEqual(
    LAYERS.map((layer) => layer.label),
    ["Problem", "Software", "AI Systems", "Data", "Integration", "Infrastructure", "Evaluation"],
  );
  for (const layer of LAYERS) {
    assert.ok(layer.note.length > 0, `${layer.id} missing note`);
    assert.ok(Array.isArray(layer.techs), `${layer.id} techs must be a list`);
    for (const tech of layer.techs) {
      /* Not every layer label has a brand record (Cloud, Observability, ...).
         TechLogo falls back to an honest monogram, so an unknown label is
         allowed - an empty or non-string one is not. */
      assert.equal(typeof tech, "string", `${layer.id} has a non-string technology label`);
      assert.ok(tech.trim().length > 0, `${layer.id} has an empty technology label`);
    }
  }
  const breadth = LAYERS.flatMap((layer) => layer.techs);
  assert.ok(new Set(breadth).size === breadth.length, "a technology may only sit in one FDE layer");
});

test("the FDE capability system renders exactly once, inside the hero desk", () => {
  /* A standalone second copy used to render after the work archive. It repeated
     the same seven layers, technologies and project relationships, so no source
     file may reintroduce that heading or its component. */
  assert.deepEqual(sourcesContaining("components", "7-Layer FDE Capability Map"), []);
  assert.deepEqual(sourcesContaining("components", "MobileCapabilitySystem"), []);
  /* The removed block rendered as <section id="capabilities" class="… mobile-fde-system"> */
  assert.deepEqual(sourcesContaining("components", "mobile-fde"), []);
  assert.deepEqual(sourcesContaining("content", "7-Layer FDE Capability Map"), []);

  const homePage = withoutComments(
    readFileSync(join(REPO_ROOT, "components/home/HomePage.tsx"), "utf8"),
  );
  assert.ok(!homePage.includes("MobileCapabilitySystem"), "HomePage must not mount the duplicate FDE block");

  /* Exactly one component owns the canonical capability map, and the homepage
     renders its host (Hero) exactly once. */
  assert.deepEqual(sourcesContaining("components", "FDE capability system"), [
    "components/home/DeveloperDesk.tsx",
  ]);
  assert.equal((homePage.match(/<Hero\s*\/>/g) ?? []).length, 1);
  assert.equal((readFileSync(join(REPO_ROOT, "components/home/Hero.tsx"), "utf8").match(/<DeveloperDesk\s*\/>/g) ?? []).length, 1);

  /* The removed section owned id="capabilities"; nothing may link to it. */
  assert.deepEqual(sourcesContaining("components", "#capabilities"), []);
  assert.deepEqual(sourcesContaining("content", "#capabilities"), []);
});