// Turns the text of a customer document into small passages that can each be
// embedded and searched. A passage is a few sentences from one page, and it
// always remembers which document and page it came from.

export type Passage = {
  id: string;
  documentId: string;
  /** The document's title, also the first line of `text`. */
  title: string;
  /** The page of the PDF the passage came from, starting at 1. */
  page: number;
  /** What gets embedded: the document title, then the passage itself. */
  text: string;
};

const MAX_SENTENCES = 3;
const MAX_CHARS = 700;
const MIN_LAST_CHARS = 120;

// Without this, "Rev. C" or "e.g. Wi-Fi" would be cut into two sentences.
const ABBREVIATION =
  /(?:\b(?:Rev|No|Inc|vs|etc|Mr|Ms|Dr|approx|Fig|St)|\be\.g|\bi\.e|\bU\.S)\.$/;

/**
 * Removes the lines that repeat on most pages of a document (the company
 * name, document number, page number and copyright line), so they don't end
 * up in every passage. Page numbers differ from page to page, so they are
 * ignored when comparing lines.
 */
export function removeRepeatedLines(pages: string[]): string[] {
  // Only page numbers are ignored ("Page 3 of 7", or a number ending the
  // line), so lines like "Step 1" and "Step 2" are never mistaken for them.
  const key = (line: string) =>
    line
      .trim()
      .replace(/\bPage \d+( of \d+)?/i, "Page #")
      .replace(/\s\d+$/, " #");
  const pagesWithLine = new Map<string, number>();
  for (const page of pages) {
    const seen = new Set(page.split("\n").map(key));
    for (const k of seen) pagesWithLine.set(k, (pagesWithLine.get(k) ?? 0) + 1);
  }
  // A line is page furniture when it's on at least half of a document's pages
  // (and on at least 3), so a heading that repeats once or twice is kept.
  const threshold = Math.max(3, Math.ceil(pages.length / 2));
  return pages.map((page) =>
    page
      .split("\n")
      .filter((line) => (pagesWithLine.get(key(line)) ?? 0) < threshold)
      .join("\n"),
  );
}

/** Splits text into sentences. Line breaks inside a sentence are just spaces. */
export function splitSentences(text: string): string[] {
  const flat = text.replace(/\s+/g, " ").trim();
  if (!flat) return [];
  const pieces = flat.split(/(?<=[.!?])\s+(?=["“(]?[A-Z0-9])/);
  const sentences: string[] = [];
  for (const piece of pieces) {
    const previous = sentences[sentences.length - 1];
    if (previous && ABBREVIATION.test(previous)) {
      sentences[sentences.length - 1] = `${previous} ${piece}`;
    } else {
      sentences.push(piece);
    }
  }
  return sentences;
}

/** Groups sentences into passages of up to 3 sentences and 700 characters. */
export function groupSentences(sentences: string[]): string[] {
  const groups: string[] = [];
  let current: string[] = [];
  const length = (parts: string[]) => parts.join(" ").length;
  for (const sentence of sentences) {
    const full =
      current.length >= MAX_SENTENCES ||
      (current.length > 0 && length([...current, sentence]) > MAX_CHARS);
    if (full) {
      groups.push(current.join(" "));
      current = [];
    }
    current.push(sentence);
  }
  if (current.length > 0) groups.push(current.join(" "));

  // A tiny leftover at the end of a page reads better joined to the one before.
  const last = groups[groups.length - 1];
  if (groups.length > 1 && last.length < MIN_LAST_CHARS) {
    groups.pop();
    groups[groups.length - 1] += ` ${last}`;
  }
  return groups;
}

/**
 * Splits one document into passages. `pages` holds the text of each page, in
 * order. Each passage's text starts with the document title.
 */
export function chunkDocument(
  doc: { id: string; title: string },
  pages: string[],
): Passage[] {
  const passages: Passage[] = [];
  removeRepeatedLines(pages).forEach((pageText, index) => {
    const page = index + 1;
    groupSentences(splitSentences(pageText)).forEach((body, n) => {
      passages.push({
        id: `${doc.id}-p${page}-${n + 1}`,
        documentId: doc.id,
        title: doc.title,
        page,
        text: `${doc.title}\n${body}`,
      });
    });
  });
  return passages;
}
