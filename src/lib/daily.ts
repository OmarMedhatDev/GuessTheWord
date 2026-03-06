/**
 * Daily word: same 5-letter word for everyone on a given date (deterministic seed).
 */
import wordList from '../data/words.json';

const WORDS: string[] = wordList as string[];

function getDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Simple numeric hash of a string for deterministic daily index */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getDateKeyForDate(date: Date): string {
  return getDateKey(date);
}

export function getDailyWord(date: Date): string {
  const key = getDateKey(date);
  const index = hashString(key) % WORDS.length;
  return WORDS[Math.abs(index)];
}

export function isSameDay(a: Date, b: Date): boolean {
  return getDateKey(a) === getDateKey(b);
}
