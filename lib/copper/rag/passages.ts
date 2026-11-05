// The searchable passages from the customer documents, with their embeddings.
// The file is made by `npm run embed`. Importing it here means it is read once
// when the server starts and then stays in memory, so searching it is instant.
import data from "@/lib/copper/data/passages.json";
import type { Passage } from "@/lib/copper/rag/chunk";

export type EmbeddedPassage = Passage & {
  /** The passage's meaning as a list of numbers, scaled to length 1. */
  embedding: number[];
};

export const PASSAGES: EmbeddedPassage[] = data.passages;
export const PASSAGES_MODEL: string = data.model;
export const PASSAGES_DIMENSIONS: number = data.dimensions;
