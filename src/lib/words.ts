/**
 * 5-letter English word list for Guess the Word.
 * Uses a comprehensive list of existing English words (valid for both target and guesses).
 */
import wordList from '../data/words.json';

const WORDS: string[] = wordList as string[];
const wordSet = new Set(WORDS.map((w) => w.toLowerCase()));

export function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function isValidWord(word: string): boolean {
  return word.length === 5 && wordSet.has(word.toLowerCase());
}
