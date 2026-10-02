import type { Experiment } from "./types";

export const experiments: Experiment[] = [];

export function getExperiment(slug: string) {
  return experiments.find((experiment) => experiment.slug === slug && experiment.publicationStatus === "PUBLISHED");
}
