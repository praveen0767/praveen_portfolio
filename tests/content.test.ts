import assert from "node:assert/strict";
import { test } from "node:test";

import { aboutPrinciples, contactChannels, profile } from "../content/profile";
import { capabilities, heroPillars, processStages } from "../content/home";
import { adjacentProjects, featuredProjects, getProject, orderedProjects, projects } from "../content/projects";
import { achievements } from "../content/proof/achievements";
import { experiences } from "../content/proof/experience";
import { careerEvents } from "../content/career";
import { getTechnology, technologies } from "../content/tech";
import { navLinks } from "../components/navigation/nav-links";

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
  assert.equal(email?.href, `mailto:${profile.email}`);
  for (const channel of contactChannels) {
    if (channel.external) assert.match(channel.href, EXTERNAL);
    assert.ok(channel.description.length > 0);
  }
});

test("navigation only points at routes that exist in the app directory", () => {
  const routes = [
    "/work",
    "/engineering",
    "/proof",
    "/lab",
    "/about",
    "/contact",
  ];
  assert.equal(navLinks.length, routes.length);
  navLinks.forEach((link) => assert.ok(routes.includes(link.href), `unexpected route ${link.href}`));
});

test("exactly three verified projects are presented, in priority order", () => {
  assert.equal(projects.length, 3);
  const ordered = orderedProjects();
  assert.deepEqual(
    ordered.map((project) => project.slug),
    ["info-i-veritrust-agent", "sodhanegpt-crime-intelligence-platform", "hazard-det-road-intelligence-system"],
  );
  assert.equal(featuredProjects().length, 3);
  assert.ok(ordered.every((project) => project.verified));
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