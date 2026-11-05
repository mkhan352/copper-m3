// @vitest-environment node
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Spec section 3.4. `field` replaces `form`, which is an empty registry item
// in the current shadcn style.
const UI = [
  "button",
  "card",
  "input",
  "textarea",
  "label",
  "select",
  "badge",
  "tabs",
  "table",
  "dialog",
  "sheet",
  "dropdown-menu",
  "field",
  "sonner",
  "skeleton",
  "scroll-area",
  "separator",
  "tooltip",
  "avatar",
  "progress",
  "chart",
];
const AI_ELEMENTS = [
  "conversation",
  "message",
  "prompt-input",
  "sources",
  "tool",
];
const LIBRARIES = [
  "next-themes",
  "lucide-react",
  "recharts",
  "@tanstack/react-table",
  "react-hook-form",
  "@hookform/resolvers",
  "date-fns",
  "zod",
  "ai",
];

const pkg = JSON.parse(readFileSync("package.json", "utf8"));

describe("UI kit", () => {
  it.each(UI)("has components/ui/%s.tsx", (name) => {
    expect(existsSync(`components/ui/${name}.tsx`)).toBe(true);
  });

  it.each(AI_ELEMENTS)("has components/ai-elements/%s.tsx", (name) => {
    expect(existsSync(`components/ai-elements/${name}.tsx`)).toBe(true);
  });

  it.each(LIBRARIES)("depends on %s at an exact version", (name) => {
    expect(pkg.dependencies[name]).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
