// @vitest-environment node
import { MockEmbeddingModelV4 } from "ai/test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AiNotConfiguredError, callEmbed, callEmbedMany } from "@/lib/ai/call";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/ai/models";

let model: MockEmbeddingModelV4;
vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: () => ({ embedding: () => model }),
}));

function embedder(tokens: number) {
  return new MockEmbeddingModelV4({
    maxEmbeddingsPerCall: 100,
    doEmbed: async ({ values }) => ({
      embeddings: values.map((_, i) => [i, i + 1]),
      usage: { tokens },
      warnings: [],
    }),
  });
}

function captureLog() {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});
  return () =>
    info.mock.calls
      .filter(([tag]) => tag === "[ai_calls]")
      .map(([, row]) => JSON.parse(row as string));
}

beforeEach(() => {
  vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "AIza-test-key");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("callEmbedMany / callEmbed", () => {
  it("returns one embedding per text, in order, and logs one row", async () => {
    const rows = captureLog();
    model = embedder(2000);
    const { embeddings } = await callEmbedMany(
      { module: 3, feature: "embed-documents" },
      { values: ["a", "b", "c"], kind: "document" },
    );
    expect(embeddings).toEqual([
      [0, 1],
      [1, 2],
      [2, 3],
    ]);
    const logged = rows();
    expect(logged).toHaveLength(1);
    expect(logged[0]).toMatchObject({
      module: 3,
      feature: "embed-documents",
      model: EMBEDDING_MODEL,
      input_tokens: 2000,
      ok: true,
    });
    expect(logged[0].cost_usd).toBeCloseTo(0.0003, 9);
  });

  it("asks for stored text and questions differently, at the app's size", async () => {
    captureLog();
    model = embedder(5);
    await callEmbedMany(
      { module: 3, feature: "embed-documents" },
      { values: ["a"], kind: "document" },
    );
    await callEmbed(
      { module: 3, feature: "embed-question" },
      { value: "q", kind: "query" },
    );
    const [first, second] = model.doEmbedCalls;
    expect(first.providerOptions?.google).toMatchObject({
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: EMBEDDING_DIMENSIONS,
    });
    expect(second.providerOptions?.google).toMatchObject({
      taskType: "RETRIEVAL_QUERY",
    });
  });

  it("logs a missing token count as null instead of crashing", async () => {
    const rows = captureLog();
    model = new MockEmbeddingModelV4({
      doEmbed: async ({ values }) => ({
        embeddings: values.map(() => [1]),
        warnings: [],
      }),
    });
    await callEmbed(
      { module: 3, feature: "embed-question" },
      { value: "q", kind: "query" },
    );
    expect(rows()[0]).toMatchObject({ input_tokens: null, cost_usd: null });
  });

  it("throws AiNotConfiguredError without a key", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");
    await expect(
      callEmbed({ module: 3, feature: "x" }, { value: "q", kind: "query" }),
    ).rejects.toBeInstanceOf(AiNotConfiguredError);
  });
});
