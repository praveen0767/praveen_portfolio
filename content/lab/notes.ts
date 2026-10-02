import type { LabNote } from "./types";

export const notes: LabNote[] = [];

export function getNote(slug: string) {
  return notes.find((note) => note.slug === slug && note.status === "PUBLISHED");
}
