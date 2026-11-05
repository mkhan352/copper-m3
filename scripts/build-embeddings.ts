// npm run embed: reads every PDF in public/docs, splits each page into small
// passages, turns each passage into an embedding with Gemini, and saves them
// all to lib/copper/data/passages.json for the app to load.
import { readFileSync, writeFileSync } from "node:fs";
import { extractText, getDocumentProxy } from "unpdf";
import { callEmbedMany, isAiConfigured } from "@/lib/ai/call";
import { EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "@/lib/ai/models";
import { chunkDocument, type Passage } from "@/lib/copper/rag/chunk";
import { DOCUMENTS } from "@/lib/copper/documents";

const OUTPUT = "lib/copper/data/passages.json";

if (!isAiConfigured()) {
  console.error(
    "GOOGLE_GENERATIVE_AI_API_KEY isn't set. Add it to .env.local, then run this again.",
  );
  process.exit(1);
}

/** Scales a vector to length 1, so comparing two is a simple multiply-and-add. */
function normalize(vector: number[]): number[] {
  const length = Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0));
  return vector.map((x) => Number((x / length).toFixed(6)));
}

async function main() {
  const passages: Passage[] = [];
  const counts: { title: string; pages: number; passages: number }[] = [];

  for (const doc of DOCUMENTS) {
    const bytes = new Uint8Array(readFileSync(`public${doc.file}`));
    const pdf = await getDocumentProxy(bytes);
    const { text: pages } = await extractText(pdf, { mergePages: false });
    const made = chunkDocument(doc, pages);
    passages.push(...made);
    counts.push({
      title: doc.title,
      pages: pages.length,
      passages: made.length,
    });
  }

  console.log(
    `Embedding ${passages.length} passages with ${EMBEDDING_MODEL}...`,
  );
  const { embeddings } = await callEmbedMany(
    { module: 3, feature: "embed-documents" },
    { values: passages.map((p) => p.text), kind: "document" },
  );

  const saved = passages.map((p, i) => ({
    ...p,
    embedding: normalize(embeddings[i]),
  }));

  // One passage per line keeps the file readable and its diffs small.
  const header = `"model":${JSON.stringify(EMBEDDING_MODEL)},"dimensions":${EMBEDDING_DIMENSIONS},"createdAt":${JSON.stringify(new Date().toISOString())}`;
  writeFileSync(
    OUTPUT,
    `{${header},"passages":[\n${saved.map((p) => JSON.stringify(p)).join(",\n")}\n]}\n`,
  );

  console.log(`\nSaved ${saved.length} passages to ${OUTPUT}\n`);
  for (const c of counts) {
    console.log(
      `${String(c.passages).padStart(4)}  ${c.title} (${c.pages} pages)`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
