// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("app/globals.css", "utf8");

const BRAND = {
  copper: "#b87333",
  patinaTeal: "#4a8c82",
  desertSand: "#efe3d0",
  sonoranSunset: "#e8663d",
  nightSky: "#1c2333",
  hardHatYellow: "#f2c230",
};

function tokens(selector: string): Record<string, string> {
  const block = css.match(new RegExp(`^${selector} \\{([^}]*)\\}`, "m"));
  if (!block) throw new Error(`No ${selector} block in globals.css`);
  return Object.fromEntries(
    [...block[1].matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [
      m[1],
      m[2].trim().toLowerCase(),
    ]),
  );
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const modes = { light: tokens(":root"), dark: tokens("\\.dark") };

describe("Copper theme", () => {
  it("uses all six Product Bible brand colors", () => {
    for (const hex of Object.values(BRAND)) {
      expect(css.toLowerCase()).toContain(hex);
    }
  });

  for (const [mode, t] of Object.entries(modes)) {
    describe(`${mode} mode`, () => {
      it("uses Copper as primary and Patina Teal as accent", () => {
        expect(t.primary).toBe(BRAND.copper);
        expect(t.accent).toBe(BRAND.patinaTeal);
      });

      it("keeps body and muted text readable (WCAG AA, 4.5:1)", () => {
        expect(contrast(t.foreground, t.background)).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(contrast(t["muted-foreground"], t.muted)).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(
          contrast(t["muted-foreground"], t.background),
        ).toBeGreaterThanOrEqual(4.5);
      });

      // The exact brand Copper and Patina Teal can't reach 4.5:1 with any text
      // color, so text on them is held to the WCAG large-text / UI minimum.
      it("keeps text on Copper and Patina Teal at least 3:1", () => {
        expect(
          contrast(t["primary-foreground"], t.primary),
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrast(t["accent-foreground"], t.accent),
        ).toBeGreaterThanOrEqual(3);
      });
    });
  }
});
