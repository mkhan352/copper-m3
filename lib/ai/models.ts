// The course's approved models. Calls go straight to Google with a Google AI
// Studio key, which is free and needs no credit card.
export const MODELS = [
  {
    id: "google/gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash-Lite (fast, free tier)",
    googleId: "gemini-3.1-flash-lite",
  },
  {
    id: "google/gemini-2.5-flash",
    label: "Gemini 2.5 Flash (fast, shows its thinking)",
    // Google's own name for it, used when calling Google.
    googleId: "gemini-2.5-flash",
  },
  {
    id: "google/gemini-3-flash",
    label: "Gemini 3 Flash (newer, thinks out loud less often)",
    googleId: "gemini-3-flash-preview",
  },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

/**
 * The model that turns text into embeddings (lists of numbers that capture
 * meaning), used to search the customer documents. 768 numbers per passage is
 * plenty for a few hundred passages and keeps the saved file small.
 */
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

/**
 * The model used when a call doesn't name one. Google no longer lets new keys
 * use 2.5 Flash, and 3 Flash is a preview with a small daily limit, so the
 * default is 3.1 Flash-Lite: it works on a free AI Studio key, follows Copper's
 * citation rules and doesn't show thinking summaries.
 */
export const DEFAULT_MODEL: ModelId = "google/gemini-3.1-flash-lite";

/** AI_MODEL if it names an approved model, otherwise the default. */
export function defaultModel(): ModelId {
  const id = process.env.AI_MODEL;
  return MODELS.find((m) => m.id === id)?.id ?? DEFAULT_MODEL;
}
