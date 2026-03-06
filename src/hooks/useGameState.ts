import { useState, useCallback } from 'react';
import type { FeedbackState } from '../lib/feedback';
import { computeFeedback } from '../lib/feedback';
import { getDailyWord, getDateKeyForDate } from '../lib/daily';
import { isValidWord } from '../lib/words';
import { hasPlayedToday, recordResult, getTodayResult } from '../lib/storage';

const MAX_ATTEMPTS = 5;
const WORD_LENGTH = 5;

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GuessResult {
  word: string;
  feedback: FeedbackState[];
}

function getTodaysWord(): string {
  return getDailyWord(new Date());
}

export function useGameState() {
  const todayKey = getDateKeyForDate(new Date());
  const alreadyPlayed = hasPlayedToday();
  const savedResult = getTodayResult();

  const [targetWord] = useState(() => getTodaysWord());
  const [guesses, setGuesses] = useState<GuessResult[]>(() => {
    if (savedResult) return [];
    return [];
  });
  const [currentGuess, setCurrentGuess] = useState('');
  const [status, setStatus] = useState<GameStatus>(() => {
    if (alreadyPlayed && savedResult) return savedResult.won ? 'won' : 'lost';
    return 'playing';
  });
  const [message, setMessage] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState<number | null>(null);

  const attemptIndex = guesses.length;
  const hasPlayedTodayAlready = alreadyPlayed;

  const clearShake = useCallback(() => setShakeRow(null), []);

  const addLetter = useCallback(
    (letter: string) => {
      if (status !== 'playing' || hasPlayedTodayAlready) return;
      const c = letter.toUpperCase().slice(0, 1);
      if (/^[A-Z]$/.test(c) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + c);
        setMessage(null);
      }
    },
    [currentGuess.length, status, hasPlayedTodayAlready]
  );

  const removeLetter = useCallback(() => {
    if (status !== 'playing' || hasPlayedTodayAlready) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
    setMessage(null);
  }, [status, hasPlayedTodayAlready]);

  const submitGuess = useCallback(() => {
    if (status !== 'playing' || hasPlayedTodayAlready) return;
    const word = currentGuess.toLowerCase();
    if (word.length !== WORD_LENGTH) {
      setMessage('Enter 5 letters');
      setShakeRow(guesses.length);
      return;
    }
    if (!isValidWord(word)) {
      setMessage('Not a valid word');
      setShakeRow(guesses.length);
      return;
    }

    const feedback = computeFeedback(word, targetWord);
    const nextGuesses = [...guesses, { word: currentGuess, feedback }];
    setGuesses(nextGuesses);
    setCurrentGuess('');
    setMessage(null);

    if (word === targetWord) {
      setStatus('won');
      setMessage('Brilliant! 🎉');
      recordResult(todayKey, nextGuesses.length, true);
      return;
    }
    if (nextGuesses.length >= MAX_ATTEMPTS) {
      setStatus('lost');
      setMessage(`The word was ${targetWord.toUpperCase()}.`);
      recordResult(todayKey, nextGuesses.length, false);
    }
  }, [currentGuess, guesses, status, targetWord, todayKey, hasPlayedTodayAlready]);

  const resetGame = useCallback(() => {
    if (hasPlayedTodayAlready) return;
    setGuesses([]);
    setCurrentGuess('');
    setStatus('playing');
    setMessage(null);
    setShakeRow(null);
  }, [hasPlayedTodayAlready]);

  return {
    targetWord,
    guesses,
    currentGuess,
    attemptIndex,
    status,
    message,
    hasPlayedTodayAlready,
    savedTodayResult: savedResult,
    shakeRow,
    clearShake,
    addLetter,
    removeLetter,
    submitGuess,
    resetGame,
    maxAttempts: MAX_ATTEMPTS,
    wordLength: WORD_LENGTH,
  };
}
