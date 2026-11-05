// Reads the Product Bible, the source of truth for course data.
import { readFileSync } from "node:fs";

export const bible = () =>
  readFileSync("docs/copper-state-labs/product-bible.md", "utf8");

/** Reads the markdown table that follows a "### `name`" heading. */
export function bibleTable(name: string): Record<string, string>[] {
  const section = bible().split(`### \`${name}\``)[1];
  if (!section) throw new Error(`Table ${name} not found in the Bible`);
  const lines = section.split("\n").map((line) => line.trim());
  const start = lines.findIndex((line) => line.startsWith("|"));
  const end = lines.findIndex((line, i) => i > start && !line.startsWith("|"));
  const [header, , ...rows] = lines.slice(start, end === -1 ? undefined : end);
  const cells = (line: string) =>
    line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());
  const columns = cells(header);
  return rows.map((row) =>
    Object.fromEntries(cells(row).map((value, i) => [columns[i], value])),
  );
}
