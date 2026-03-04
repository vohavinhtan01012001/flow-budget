import type { TParsedExpense } from '@/models/types/expense.type';

import {
  AMOUNT_SUFFIXES,
  DEFAULT_KEYWORD_MAPPINGS,
} from '@/constants/expense.const';

/**
 * Parse expense input like "cf 25k", "25k cf", "cà phê 25000", "1.5tr điện"
 */
export const parseExpenseInput = (input: string): null | TParsedExpense => {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const amount = extractAmount(trimmed);
  if (!amount) return null;

  const description = extractDescription(trimmed);
  const categoryKeyword = findCategoryKeyword(description);

  return {
    amount,
    categoryKeyword,
    description,
    rawInput: input,
  };
};

const extractAmount = (input: string): null | number => {
  // Match patterns: "25k", "1.5tr", "25000", "25,000", "25.000"
  const amountRegex =
    /(\d+[.,]?\d*)\s*(k|tr|d|nghin|nghìn|trieu|triệu)?/i;
  const match = input.match(amountRegex);

  if (!match) return null;

  // Parse the number part, handle both "1.5" (decimal) and "25.000" (thousands separator)
  let numStr = match[1];
  const suffix = match[2]?.toLowerCase();

  // If number has comma or dot followed by exactly 3 digits, treat as thousands separator
  if (/^\d+[.,]\d{3}$/.test(numStr)) {
    numStr = numStr.replace(/[.,]/g, '');
  } else {
    // Otherwise treat dot/comma as decimal
    numStr = numStr.replace(',', '.');
  }

  let amount = parseFloat(numStr);
  if (isNaN(amount) || amount <= 0) return null;

  // Apply suffix multiplier
  if (suffix) {
    const multiplier = AMOUNT_SUFFIXES[suffix];
    if (multiplier) amount *= multiplier;
  } else if (amount < 1000) {
    // Numbers < 1000 without suffix → multiply by 1000 (e.g., "grab 35" → 35,000)
    amount *= 1000;
  }

  return Math.round(amount);
};

const extractDescription = (input: string): string => {
  // Remove the amount part and clean up
  return input
    .replace(
      /\d+[.,]?\d*\s*(k|tr|d|nghin|nghìn|trieu|triệu)?/i,
      '',
    )
    .trim();
};

/**
 * Find the best matching category keyword from the description.
 * Prioritizes longer keywords (e.g., "ăn trưa" > "ăn").
 */
export const findCategoryKeyword = (
  description: string,
): null | string => {
  if (!description) return null;

  const desc = description.toLowerCase();
  const keywords = Object.keys(DEFAULT_KEYWORD_MAPPINGS);

  // Sort by length descending to match longest keyword first
  const sorted = keywords.sort((a, b) => b.length - a.length);

  for (const keyword of sorted) {
    if (desc.includes(keyword)) {
      return keyword;
    }
  }

  // If no keyword match, use the description itself as keyword
  return desc || null;
};

/**
 * Resolve a keyword to a category name using the default mappings.
 */
export const resolveCategory = (keyword: string): null | string => {
  const lower = keyword.toLowerCase();
  return DEFAULT_KEYWORD_MAPPINGS[lower] ?? null;
};

/**
 * Format amount in VND
 */
export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

/**
 * Format amount as short form (e.g., 25000 → "25k", 1500000 → "1.5tr")
 */
export const formatAmountShort = (amount: number): string => {
  if (amount >= 1_000_000) {
    const tr = amount / 1_000_000;
    return Number.isInteger(tr) ? `${tr}tr` : `${tr.toFixed(1)}tr`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    return Number.isInteger(k) ? `${k}k` : `${k.toFixed(1)}k`;
  }
  return String(amount);
};
