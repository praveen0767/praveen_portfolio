import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExperimentDetailPage } from "../../../../components/lab/LabDetailPage";
import { experiments, getExperiment } from "../../../../content/lab/experiments";
import { pageMetadata } from "../../../../lib/seo";

type ExperimentRouteProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return experiments.filter((experiment) => experiment.publicationStatus === "PUBLISHED").map((experiment) => ({ slug: experiment.slug }));
}

export async function generateMetadata({ params }: ExperimentRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  return experiment ? pageMetadata(`${experiment.title} - Engineering Lab - Praveen Kumar S`, experiment.question, `/lab/experiments/${experiment.slug}`) : {};
}

export default async function ExperimentRoute({ params }: ExperimentRouteProps) {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (experiment === undefined) {
    notFound();
  }
  return <ExperimentDetailPage experiment={experiment} />;
}
