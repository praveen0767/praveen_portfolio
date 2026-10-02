import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/seo";
import { projects } from "../content/projects";
import { experiments } from "../content/lab/experiments";
import { notes } from "../content/lab/notes";

const staticRoutes = ["", "/work", "/engineering", "/proof", "/lab", "/lab/notes", "/lab/experiments", "/lab/build-log", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = staticRoutes.map((route) => ({ url: new URL(route, siteUrl).toString() }));
  const projectRoutes = projects.filter((project) => project.verified).map((project) => ({ url: new URL(`/work/${project.slug}`, siteUrl).toString() }));
  const noteRoutes = notes.filter((note) => note.status === "PUBLISHED").map((note) => ({ url: new URL(`/lab/notes/${note.slug}`, siteUrl).toString(), lastModified: new Date(note.date) }));
  const experimentRoutes = experiments.filter((experiment) => experiment.publicationStatus === "PUBLISHED").map((experiment) => ({ url: new URL(`/lab/experiments/${experiment.slug}`, siteUrl).toString(), lastModified: new Date(experiment.date) }));
  return [...routes, ...projectRoutes, ...noteRoutes, ...experimentRoutes];
}
