/**
 * Convert Vietnamese number words in text to digits.
 * "cà phê hai lăm nghìn" → "cà phê 25k"
 * "năm mươi nghìn" → "50k"
 * "một triệu hai" → "1200k"
 */

const DIGIT_MAP: Record<string, number> = {
  'ba': 3,
  'bảy': 7,
  'bốn': 4,
  'chín': 9,
  'hai': 2,
  'không': 0,
  'lăm': 5,
  'lẻ': 0,
  'linh': 0,
  'mốt': 1,
  'một': 1,
  'mươi': 10,
  'mười': 10,
  'năm': 5,
  'nửa': 5,
  'sáu': 6,
  'tám': 8,
  'tư': 4,
};

const UNIT_MAP: Record<string, number> = {
  'ngàn': 1_000,
  'nghin': 1_000,
  'nghìn': 1_000,
  'trieu': 1_000_000,
  'triệu': 1_000_000,
};

// All known Vietnamese number words
const ALL_WORDS = new Set([
  'rưỡi',
  'trăm',
  ...Object.keys(DIGIT_MAP),
  ...Object.keys(UNIT_MAP),
]);

function parseVietnameseNumber(words: string[]): null | number {
  if (words.length === 0) return null;

  let total = 0;
  let current = 0;
  let lastUnit = 0;
  let hasNumber = false;

  for (const w of words) {
    const digit = DIGIT_MAP[w];
    const unit = UNIT_MAP[w];

    if (w === 'rưỡi') {
      // "rưỡi" = half of the last unit (e.g., "một triệu rưỡi" = 1,500,000)
      if (lastUnit > 0) {
        total += lastUnit / 2;
      }
      hasNumber = true;
    } else if (w === 'trăm') {
      current = (current || 1) * 100;
      hasNumber = true;
    } else if (w === 'mười' || w === 'mươi') {
      current = current === 0 ? 10 : current * 10;
      hasNumber = true;
    } else if (unit !== undefined) {
      current = (current || 1) * unit;
      total += current;
      lastUnit = unit;
      current = 0;
      hasNumber = true;
    } else if (digit !== undefined) {
      current += digit;
      hasNumber = true;
    }
  }

  total += current;
  return hasNumber && total > 0 ? total : null;
}

export const convertVietnameseNumbers = (text: string): string => {
  const words = text.toLowerCase().split(/\s+/);
  const result: string[] = [];
  let numBuffer: string[] = [];

  const flushBuffer = () => {
    if (numBuffer.length === 0) return;
    const num = parseVietnameseNumber(numBuffer);
    if (num !== null) {
      // Format: 25000 → "25k", 1500000 → "1500k"
      if (num >= 1000 && num % 1000 === 0) {
        result.push(`${num / 1000}k`);
      } else {
        result.push(String(num));
      }
    } else {
      result.push(...numBuffer);
    }
    numBuffer = [];
  };

  for (const word of words) {
    if (ALL_WORDS.has(word)) {
      numBuffer.push(word);
    } else {
      flushBuffer();
      result.push(word);
    }
  }
  flushBuffer();

  return result.join(' ');
};
