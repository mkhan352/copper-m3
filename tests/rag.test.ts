// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  chunkDocument,
  groupSentences,
  removeRepeatedLines,
  splitSentences,
} from "@/lib/copper/rag/chunk";
import { DOCUMENTS } from "@/lib/copper/documents";
import {
  PASSAGES,
  PASSAGES_DIMENSIONS,
  PASSAGES_MODEL,
} from "@/lib/copper/rag/passages";

describe("splitSentences", () => {
  it("splits on full stops and joins wrapped lines", () => {
    expect(
      splitSentences("First one.\nSecond one that\nwraps. Third?"),
    ).toEqual(["First one.", "Second one that wraps.", "Third?"]);
  });

  it("doesn't cut after abbreviations like Rev. or e.g.", () => {
    expect(splitSentences("See Rev. C for details. Use e.g. Wi-Fi.")).toEqual([
      "See Rev. C for details.",
      "Use e.g. Wi-Fi.",
    ]);
  });
});

describe("groupSentences", () => {
  it("makes passages of at most 3 sentences and about 700 characters", () => {
    const sentences = Array.from(
      { length: 9 },
      (_, i) => `Sentence number ${i} is a reasonably long one.`,
    );
    const groups = groupSentences(sentences);
    for (const g of groups)
      expect(splitSentences(g).length).toBeLessThanOrEqual(3);

    const long = "x".repeat(400) + ".";
    for (const g of groupSentences([long, long, long])) {
      expect(g.length).toBeLessThanOrEqual(805);
    }
  });

  it("joins a tiny last passage onto the one before it", () => {
    const groups = groupSentences([
      "A fairly long first sentence about the product. ".repeat(2).trim(),
      "Another sentence that is also fairly long for the test run.",
      "A third sentence that is long enough to count properly here.",
      "Ok.",
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].endsWith("Ok.")).toBe(true);
  });
});

describe("removeRepeatedLines", () => {
  it("drops lines that repeat on most pages, even when the page number changes", () => {
    const pages = [1, 2, 3, 4].map(
      (n) =>
        `ACME\nGuide Page ${n} of 4\nStep ${n}: real content for page ${n}.`,
    );
    const cleaned = removeRepeatedLines(pages);
    expect(cleaned[0]).toBe("Step 1: real content for page 1.");
    expect(cleaned[3]).toBe("Step 4: real content for page 4.");
  });
});

describe("chunkDocument", () => {
  const doc = { id: "demo-guide", title: "Demo Guide" };

  it("keeps the title and page number with each passage, title first", () => {
    const passages = chunkDocument(doc, [
      "Page one has a sentence. It has a second one.",
      "Page two is here.",
    ]);
    expect(passages.map((p) => p.page)).toEqual([1, 2]);
    for (const p of passages) {
      expect(p.title).toBe("Demo Guide");
      expect(p.documentId).toBe("demo-guide");
      expect(p.text.startsWith("Demo Guide\n")).toBe(true);
    }
    expect(new Set(passages.map((p) => p.id)).size).toBe(passages.length);
  });
});

describe("the saved passages file", () => {
  it("was made with Gemini's embedding model", () => {
    expect(PASSAGES_MODEL).toBe("gemini-embedding-001");
  });

  it("has passages from every customer document", () => {
    for (const doc of DOCUMENTS) {
      expect(
        PASSAGES.filter((p) => p.documentId === doc.id).length,
      ).toBeGreaterThan(0);
    }
  });

  it("starts every passage with its title and gives it a page and an embedding", () => {
    expect(new Set(PASSAGES.map((p) => p.id)).size).toBe(PASSAGES.length);
    for (const p of PASSAGES) {
      const doc = DOCUMENTS.find((d) => d.id === p.documentId);
      expect(doc?.title).toBe(p.title);
      expect(p.text.startsWith(`${p.title}\n`)).toBe(true);
      expect(p.page).toBeGreaterThanOrEqual(1);
      expect(p.embedding).toHaveLength(PASSAGES_DIMENSIONS);
    }
  });
});
