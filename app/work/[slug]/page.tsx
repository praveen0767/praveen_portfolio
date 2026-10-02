import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyPage } from "../../../components/work/CaseStudyPage";
import { getProject, projects } from "../../../content/projects";
import { pageMetadata } from "../../../lib/seo";

type ProjectRouteProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const metadata = pageMetadata(`${project.title} - Praveen Kumar S`, project.shortDescription, `/work/${project.slug}`);
  return project.verified ? metadata : { ...metadata, robots: { index: false, follow: false } };
}

export default async function ProjectPage({ params }: ProjectRouteProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (project === undefined) {
    notFound();
    return null;
  }
  return <CaseStudyPage project={project} />;
}
