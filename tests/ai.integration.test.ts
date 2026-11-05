// @vitest-environment node
import { existsSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

// A real call to Google logs one [ai_calls] line with tokens, cost and
// latency. Runs only when a Google key is set; otherwise it's skipped.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const ready = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

describe.skipIf(!ready)("AI call logging (live Google key)", () => {
  it("logs one row with tokens, cost and latency", async () => {
    const { callText } = await import("@/lib/ai/call");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    await callText(
      { module: 0, feature: `integration-test-${Date.now()}` },
      { prompt: "Reply with the word copper." },
    );

    const logged = info.mock.calls.find(([tag]) => tag === "[ai_calls]");
    expect(logged, "an [ai_calls] line was printed").toBeDefined();
    const row = JSON.parse(logged![1] as string);
    expect(row.input_tokens).toBeGreaterThan(0);
    expect(row.output_tokens).toBeGreaterThan(0);
    expect(row.cost_usd).toBeGreaterThan(0);
    expect(row.latency_ms).toBeGreaterThan(0);
    expect(row.ok).toBe(true);
    info.mockRestore();
  }, 60_000);
});
