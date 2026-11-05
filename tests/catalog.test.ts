// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  formatMemory,
  formatNotesHours,
  formatUsd,
  getPlans,
  getPrivacySummary,
  getProducts,
} from "@/lib/copper/catalog";
import { bible, bibleTable } from "./helpers/bible";

describe("lib/copper/catalog.ts matches the Product Bible", () => {
  it("has each product's price from the products table", () => {
    const table = bibleTable("products");
    expect(getProducts().map((p) => [p.name, p.priceUsd])).toEqual(
      table.map((row) => [row.product, Number(row.price_usd)]),
    );
  });

  it("has each plan's prices, memory and Notes hours from the plans table", () => {
    const table = bibleTable("plans");
    expect(
      getPlans().map((p) => [
        p.name,
        p.monthlyUsd,
        p.annualUsd,
        p.memoryDays,
        p.notesHoursPerMonth,
        p.refinedAnswers,
      ]),
    ).toEqual(
      table.map((row) => [
        row.plan,
        Number(row.monthly_usd),
        Number(row.annual_usd),
        Number(row.memory_days),
        row.notes_hours_per_month,
        row.refined_tier === "Yes",
      ]),
    );
  });

  it("uses Bible feature names and colors", () => {
    const text = bible();
    for (const product of getProducts()) {
      for (const feature of product.features) {
        expect(text).toContain(`**${feature.name}:**`);
      }
      const colorRow = text.split("\n").find((l) => l.startsWith("| Colors |"));
      for (const color of product.colors) expect(colorRow).toContain(color);
    }
  });

  it("summarizes the 2026 privacy policy, never the old one or the FAQ trap", () => {
    const privacy = getPrivacySummary();
    const text = privacy.points.join(" ");
    expect(privacy.policy).toBe("2026");
    expect(text).toContain("Hey Copper");
    expect(text).toMatch(/30 days on Free, 12 months on Copper Plus/);
    expect(text).toContain("Copper app");
    expect(text).not.toMatch(/18 months|never records/i);
  });

  it("formats prices, memory and Notes hours the way the page shows them", () => {
    expect([formatUsd(149), formatUsd(7.99), formatUsd(0)]).toEqual([
      "$149",
      "$7.99",
      "$0",
    ]);
    expect([formatMemory(30), formatMemory(365)]).toEqual([
      "30 days",
      "12 months",
    ]);
    expect([formatNotesHours("10"), formatNotesHours("Unlimited")]).toEqual([
      "10 hours/month",
      "Unlimited",
    ]);
  });
});
