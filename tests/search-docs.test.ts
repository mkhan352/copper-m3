// @vitest-environment node
// search_docs: embeds a question, finds the 5 closest passages and returns
// each with its document title, page and a link to that page. A mock model
// stands in for Gemini, so these cost nothing: the "question" is given the
// saved embedding of the passage that should answer it, which checks the
// search, the ranking, the links and the wiring into Ask Copper.
import type { LanguageModelV4StreamPart as ModelStreamPart } from "@ai-sdk/provider";
import {
  convertArrayToReadableStream,
  MockEmbeddingModelV4,
  MockLanguageModelV4,
} from "ai/test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { finalValue } from "@/lib/ai/live";
import { toolCallsOf } from "@/lib/copper/assistant/progress";
import type { DocSearchResult } from "@/lib/copper/assistant/tools";
import { closestPassages, normalize } from "@/lib/copper/rag/search";
import { PASSAGES } from "@/lib/copper/rag/passages";

let embedder: MockEmbeddingModelV4;
let chat: MockLanguageModelV4;
vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: () =>
    Object.assign(() => chat, { embedding: () => embedder }),
}));

const passage = (id: string) => PASSAGES.find((p) => p.id === id)!;

/** An embedder that "understands" every question as this passage's meaning. */
function embedsAs(id: string) {
  return new MockEmbeddingModelV4({
    doEmbed: async ({ values }) => ({
      embeddings: values.map(() => passage(id).embedding),
      usage: { tokens: 6 },
      warnings: [],
    }),
  });
}

// The passages that answer the three test questions.
const C47 = "copper-home-user-guide-p9-2";
const REFUND = "copper-terms-and-conditions-p4-6";
const RESET = "copper-home-user-guide-p9-3";

beforeEach(() => {
  vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "AIza-test-key");
  vi.spyOn(console, "info").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("closestPassages", () => {
  it("ranks passages by closeness and returns title, page, link and similarity", () => {
    const hits = closestPassages(passage(C47).embedding);
    expect(hits).toHaveLength(5);
    expect(hits[0]).toMatchObject({
      rank: 1,
      title: "Copper Home User Guide",
      page: 9,
      url: "/docs/copper-home-user-guide.pdf#page=9",
    });
    expect(hits[0].text).toContain("C-47");
    expect(hits[0].text.startsWith("Copper Home User Guide")).toBe(false);
    const scores = hits.map((h) => h.similarity);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(scores[0]).toBeGreaterThan(0.99);
  });

  it("doesn't need the question's numbers to be scaled first", () => {
    const big = passage(REFUND).embedding.map((x) => x * 50);
    expect(closestPassages(big)[0].text).toContain("Annual");
    expect(Math.hypot(...normalize(big))).toBeCloseTo(1, 6);
  });

  it("links every hit to its own PDF at its own page", () => {
    for (const hit of closestPassages(passage(RESET).embedding, 20)) {
      expect(hit.url).toMatch(/^\/docs\/[a-z-]+\.pdf#page=\d+$/);
    }
  });
});

describe("the search_docs tool", () => {
  async function search(question: string, id: string) {
    embedder = embedsAs(id);
    const { copperTools } = await import("@/lib/copper/assistant/tools");
    const run = copperTools.search_docs.execute!;
    return (await run(
      { question },
      { toolCallId: "t", messages: [], context: {} },
    )) as DocSearchResult;
  }

  it.each([
    ["C-47", C47, "Copper Home User Guide", /C-47/],
    [
      "annual refund",
      REFUND,
      "Copper State Labs Terms and Conditions",
      /Annual/,
    ],
    ["reset Wi-Fi", RESET, "Copper Home User Guide", /reset/i],
  ])(
    "%s: returns 5 passages with title, page and link",
    async (question, id, title, words) => {
      const result = await search(question, id);
      expect(result).toMatchObject({ status: "ok" });
      if (result.status !== "ok") return;
      expect(result.passages).toHaveLength(5);
      expect(result.passages[0].title).toBe(title);
      expect(result.passages[0].text).toMatch(words);
      for (const p of result.passages) {
        expect(p.title).toBeTruthy();
        expect(p.page).toBeGreaterThanOrEqual(1);
        expect(p.url).toContain(`#page=${p.page}`);
      }
    },
  );

  it("embeds the question as a question, not as a stored document", async () => {
    await search("annual refund", REFUND);
    expect(embedder.doEmbedCalls[0].values).toEqual(["annual refund"]);
    expect(embedder.doEmbedCalls[0].providerOptions?.google).toMatchObject({
      taskType: "RETRIEVAL_QUERY",
    });
  });

  it("says the documents can't be searched when embedding fails", async () => {
    embedder = new MockEmbeddingModelV4({
      doEmbed: async () => {
        throw new Error("boom");
      },
    });
    const { copperTools } = await import("@/lib/copper/assistant/tools");
    const result = await copperTools.search_docs.execute!(
      { question: "C-47" },
      { toolCallId: "t", messages: [], context: {} },
    );
    expect(result).toMatchObject({ status: "unavailable" });
  });
});

describe("Copper uses search_docs", () => {
  const usage = {
    inputTokens: {
      total: 5,
      noCache: 5,
      cacheRead: undefined,
      cacheWrite: undefined,
    },
    outputTokens: { total: 5, text: 5, reasoning: undefined },
  };
  const finish = (reason: "stop" | "tool-calls") => ({
    type: "finish" as const,
    finishReason: { unified: reason, raw: undefined },
    usage,
  });
  type Part = ModelStreamPart;

  function callsThenAnswers(question: string, reply: string) {
    const input = JSON.stringify({ question });
    const steps: Part[][] = [
      [
        { type: "tool-input-start", id: "c1", toolName: "search_docs" },
        { type: "tool-input-delta", id: "c1", delta: input },
        { type: "tool-input-end", id: "c1" },
        { type: "tool-call", toolCallId: "c1", toolName: "search_docs", input },
        finish("tool-calls"),
      ],
      [
        { type: "text-start", id: "t1" },
        { type: "text-delta", id: "t1", delta: reply },
        { type: "text-end", id: "t1" },
        finish("stop"),
      ],
    ];
    let n = 0;
    return new MockLanguageModelV4({
      doStream: async () => ({
        stream: convertArrayToReadableStream(steps[n++] ?? []),
      }),
    });
  }

  it("offers the tool, and tells Copper to use it for setup, troubleshooting, warranty and policy", async () => {
    const { COPPER_INSTRUCTIONS } =
      await import("@/lib/copper/assistant/instructions");
    expect(COPPER_INSTRUCTIONS).toContain("search_docs");
    for (const topic of ["setup", "troubleshooting", "warranty", "policy"]) {
      expect(COPPER_INSTRUCTIONS).toContain(topic);
    }
    expect(COPPER_INSTRUCTIONS).toMatch(/page/i);
  });

  it("searches, then answers from what the search returned", async () => {
    embedder = embedsAs(C47);
    chat = callsThenAnswers(
      "What does error C-47 mean?",
      "C-47 is a microphone array fault (Copper Home User Guide, page 9).",
    );
    const { askCopper } = await import("@/lib/copper/assistant/ask");
    const result = await askCopper({
      messages: [{ role: "user", content: "What does error C-47 mean?" }],
      useTools: true,
    });
    const progress = await finalValue(result.progress);
    const [call] = toolCallsOf(progress);
    expect(call.name).toBe("search_docs");
    expect(call.input).toEqual({ question: "What does error C-47 mean?" });
    expect(call.output).toMatchObject({ status: "ok" });
    expect(progress.reply).toContain("page 9");
    const names = (chat.doStreamCalls[0].tools ?? []).map((t) => t.name);
    expect(names).toContain("search_docs");
  });
});
