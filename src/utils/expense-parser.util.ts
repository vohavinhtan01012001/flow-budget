import type { TParsedExpense } from '@/models/types/expense.type';

import {
  AMOUNT_SUFFIXES,
  DEFAULT_KEYWORD_MAPPINGS,
} from '@/constants/expense.const';

/**
 * Parse expense input like "cf 25k", "25k cf", "cà phê 25000", "1.5tr điện"
 */
export const parseExpenseInput = (
  input: string,
  customMappings?: Record<string, string>,
): null | TParsedExpense => {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  const amount = extractAmount(trimmed);
  if (!amount) return null;

  const description = extractDescription(trimmed);
  const categoryKeyword = findCategoryKeyword(description, customMappings);

  return {
    amount,
    categoryKeyword,
    description,
    rawInput: input,
  };
};

const AMOUNT_PATTERN =
  /(\d+[.,]?\d*)\s*(k|tr|d|nghin|nghìn|trieu|triệu)?/gi;

const parseOneAmount = (
  numRaw: string,
  suffix: string | undefined,
): number => {
  let numStr = numRaw;

  // "25.000" → thousands separator; "1.5" → decimal
  if (/^\d+[.,]\d{3}$/.test(numStr)) {
    numStr = numStr.replace(/[.,]/g, '');
  } else {
    numStr = numStr.replace(',', '.');
  }

  let amount = parseFloat(numStr);
  if (isNaN(amount) || amount <= 0) return 0;

  if (suffix) {
    const multiplier = AMOUNT_SUFFIXES[suffix.toLowerCase()];
    if (multiplier) amount *= multiplier;
  }

  return amount;
};

const extractAmount = (input: string): null | number => {
  // Find all amount patterns and sum adjacent ones
  // Handles compound amounts like "1000k 500k" → 1,500,000
  const matches = [...input.matchAll(AMOUNT_PATTERN)];
  if (matches.length === 0) return null;

  let total = 0;
  let lastEnd = -1;

  for (const match of matches) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const between = input.slice(lastEnd, start);

    // Only sum if adjacent (first match, or only whitespace between)
    if (lastEnd === -1 || /^\s*$/.test(between)) {
      total += parseOneAmount(match[1], match[2]);
      lastEnd = end;
    } else {
      break; // Stop at first non-adjacent amount
    }
  }

  if (total <= 0) return null;

  // Numbers < 1000 without any suffix → multiply by 1000
  // Only apply when there's a single match with no suffix
  if (
    matches.length === 1 &&
    !matches[0][2] &&
    total < 1000
  ) {
    total *= 1000;
  }

  return Math.round(total);
};

const extractDescription = (input: string): string => {
  // Remove all adjacent amount parts and clean up
  return input.replace(AMOUNT_PATTERN, '').trim();
};

/**
 * Find the best matching category keyword from the description.
 * Prioritizes longer keywords (e.g., "ăn trưa" > "ăn").
 * Custom mappings take priority over defaults.
 */
export const findCategoryKeyword = (
  description: string,
  customMappings?: Record<string, string>,
): null | string => {
  if (!description) return null;

  const desc = description.toLowerCase();
  const allMappings = { ...DEFAULT_KEYWORD_MAPPINGS, ...customMappings };
  const keywords = Object.keys(allMappings);

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
 * Resolve a keyword to a category name.
 * Priority: keyword mappings (default + custom) → category name match → null
 */
export const resolveCategory = (
  keyword: string,
  customMappings?: Record<string, string>,
  categoryNames?: string[],
): null | string => {
  const lower = keyword.toLowerCase();
  const allMappings = { ...DEFAULT_KEYWORD_MAPPINGS, ...customMappings };

  // 1. Try keyword mappings first
  if (allMappings[lower]) return allMappings[lower];

  // 2. Fallback: check if description contains a category name
  if (categoryNames?.length) {
    // Sort by length descending to match longest name first
    const sorted = [...categoryNames].sort(
      (a, b) => b.length - a.length,
    );
    for (const name of sorted) {
      if (lower.includes(name.toLowerCase())) return name;
    }
  }

  return null;
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
