// Copper State Labs' products, plans and privacy facts (Product Bible §3, §4,
// §8 and §10). Pages read prices and plan details from here, never typing them.
import data from "./data/catalog.json";

export type ProductId = "copper-home" | "copper-notes";

export type Product = {
  id: ProductId;
  name: string;
  type: string;
  priceUsd: number;
  features: { name: string; description: string }[];
  colors: string[];
  /** Transparent product cutout, under public/ after Module 1 Step 0. */
  cutout: string;
  /** Lifestyle photos, under public/ after Module 1 Step 0. */
  lifestyle: string[];
};

export type Plan = {
  id: "free" | "copper-plus";
  name: string;
  monthlyUsd: number;
  annualUsd: number;
  memoryDays: number;
  /** A number of hours, or "Unlimited". */
  notesHoursPerMonth: string;
  refinedAnswers: boolean;
};

export type PrivacySummary = {
  policy: string;
  wakeWord: string;
  points: string[];
};

export function getProducts(): Product[] {
  return structuredClone(data.products) as Product[];
}

export function getPlans(): Plan[] {
  return structuredClone(data.plans) as Plan[];
}

export function getPrivacySummary(): PrivacySummary {
  return structuredClone(data.privacy);
}

/** "$149", "$7.99", "$0". */
export function formatUsd(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}

/** 30 → "30 days", 365 → "12 months". */
export function formatMemory(days: number): string {
  if (days % 365 === 0) return `${(days / 365) * 12} months`;
  return `${days} days`;
}

/** "10" → "10 hours/month", "Unlimited" → "Unlimited". */
export function formatNotesHours(hours: string): string {
  return /^\d+$/.test(hours) ? `${hours} hours/month` : hours;
}
