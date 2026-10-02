export type LabStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ExperimentStatus = "EXPLORING" | "TESTING" | "VALIDATED" | "INCONCLUSIVE" | "ARCHIVED";

export type LabNote = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
  tags: string[];
  content: string[];
  featured: boolean;
  status: LabStatus;
  relatedProjects?: string[];
};

export type Experiment = {
  slug: string;
  title: string;
  date: string;
  status: ExperimentStatus;
  question: string;
  hypothesis: string;
  method: string;
  result: string;
  learning: string;
  nextStep: string;
  technologies: string[];
  relatedProject?: string;
  content: string[];
  publicationStatus: LabStatus;
};

export type BuildLogEntry = {
  id: string;
  date: string;
  title: string;
  description: string;
  category: "BUILD" | "LEARN" | "EXPERIMENT" | "RESEARCH" | "DESIGN";
  relatedProject?: string;
  link?: string;
};

export type NowProfile = {
  building: string[];
  learning: string[];
  exploring: string[];
  updatedAt?: string;
};
