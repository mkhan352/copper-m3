// Finds the passages whose meaning is closest to a question. The question and
// every passage are lists of numbers (embeddings); the closer two lists point
// the same way, the more alike their meaning. All passages are in memory, so
// comparing a question with every one of them takes a blink.
import { DOCUMENTS } from "@/lib/copper/documents";
import { PASSAGES, type EmbeddedPassage } from "@/lib/copper/rag/passages";

export type DocHit = {
  rank: number;
  title: string;
  page: number;
  /** The passage itself, without the title line that was added for embedding. */
  text: string;
  /** Opens the PDF at this passage's page. */
  url: string;
  /** 1 means the same meaning; the closest passages usually score 0.6 to 0.8. */
  similarity: number;
};

export const DEFAULT_RESULTS = 5;

/** Scales a list of numbers to length 1, so comparing two is multiply-and-add. */
export function normalize(vector: number[]): number[] {
  const length = Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0));
  return length === 0 ? vector : vector.map((x) => x / length);
}

function similarity(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

/** The link that opens a document's PDF at a page (browsers read #page=N). */
export function pageLink(documentId: string, page: number): string {
  const doc = DOCUMENTS.find((d) => d.id === documentId);
  return `${doc?.file ?? `/docs/${documentId}.pdf`}#page=${page}`;
}

/** The passage without the document title that starts its embedded text. */
function bodyOf(passage: EmbeddedPassage): string {
  const prefix = `${passage.title}\n`;
  return passage.text.startsWith(prefix)
    ? passage.text.slice(prefix.length)
    : passage.text;
}

/**
 * The `count` passages closest in meaning to the question's embedding, best
 * first. Passages are passed in so tests can use a small set.
 */
export function closestPassages(
  questionEmbedding: number[],
  count = DEFAULT_RESULTS,
  passages: EmbeddedPassage[] = PASSAGES,
): DocHit[] {
  const question = normalize(questionEmbedding);
  return passages
    .map((passage) => ({
      passage,
      score: similarity(question, passage.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ passage, score }, index) => ({
      rank: index + 1,
      title: passage.title,
      page: passage.page,
      text: bodyOf(passage),
      url: pageLink(passage.documentId, passage.page),
      similarity: Math.round(score * 1000) / 1000,
    }));
}
