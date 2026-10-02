import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoteDetailPage } from "../../../../components/lab/LabDetailPage";
import { getNote, notes } from "../../../../content/lab/notes";
import { pageMetadata } from "../../../../lib/seo";

type NoteRouteProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return notes.filter((note) => note.status === "PUBLISHED").map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: NoteRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  return note ? pageMetadata(`${note.title} - Praveen Kumar S`, note.description, `/lab/notes/${note.slug}`) : {};
}

export default async function NoteRoute({ params }: NoteRouteProps) {
  const { slug } = await params;
  const note = getNote(slug);
  if (note === undefined) {
    notFound();
  }
  return <NoteDetailPage note={note} />;
}
