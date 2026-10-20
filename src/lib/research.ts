import { getCollection, type CollectionEntry } from "astro:content";
import { research as projects, type ResearchEntry } from "../data/research";

export const isPublishedNote = (note: CollectionEntry<"research">) =>
  !note.data.draft && !note.id.split("/").some((part) => part.startsWith("."));

export const noteHref = (note: CollectionEntry<"research">) =>
  `/research/notes/${note.id}.html`;

export async function getPublishedNotes() {
  return (await getCollection("research")).filter(isPublishedNote);
}

export async function getResearchEntries(): Promise<ResearchEntry[]> {
  const notes = await getPublishedNotes();
  return [
    ...projects,
    ...notes.map((note) => ({
      slug: note.id,
      title: note.data.title,
      summary: note.data.summary,
      date: note.data.date,
      updated: note.data.updated,
      status: note.data.status,
      tags: note.data.tags,
      href: noteHref(note),
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));
}
