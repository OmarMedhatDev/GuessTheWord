import { useCallback, useEffect } from 'react';
import type { FeedbackState } from '../lib/feedback';
import type { useGameState } from '../hooks/useGameState';
import styles from './Keyboard.module.css';

type GameState = ReturnType<typeof useGameState>;

const ROW1 = 'QWERTYUIOP';
const ROW2 = 'ASDFGHJKL';
const ROW3 = 'ZXCVBNM';

function getLetterStatus(
  letter: string,
  guesses: GameState['guesses']
): FeedbackState | null {
  let status: FeedbackState | null = null;
  for (const { feedback, word } of guesses) {
    const i = word.indexOf(letter);
    if (i === -1) continue;
    const s = feedback[i];
    if (s === 'green') return 'green';
    if (s === 'yellow') status = 'yellow';
    if (s === 'gray' && !status) status = 'gray';
  }
  return status;
}

interface KeyboardProps {
  addLetter: GameState['addLetter'];
  removeLetter: GameState['removeLetter'];
  submitGuess: GameState['submitGuess'];
  guesses: GameState['guesses'];
  status: GameState['status'];
}

export function Keyboard({
  addLetter,
  removeLetter,
  submitGuess,
  guesses,
  status,
}: KeyboardProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (status !== 'playing') return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        submitGuess();
        return;
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        removeLetter();
        return;
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        addLetter(e.key);
      }
    },
    [addLetter, removeLetter, submitGuess, status]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderKey = (key: string) => {
    const letterStatus = getLetterStatus(key, guesses);
    return (
      <button
        key={key}
        type="button"
        className={`${styles.key} ${letterStatus ? styles[letterStatus] : ''}`}
        onClick={() => addLetter(key)}
        aria-label={`Key ${key}`}
      >
        {key}
      </button>
    );
  };

  return (
    <div className={styles.keyboard} role="group" aria-label="On-screen keyboard">
      <div className={styles.row}>
        {ROW1.split('').map(renderKey)}
      </div>
      <div className={styles.row}>
        {ROW2.split('').map(renderKey)}
      </div>
      <div className={styles.row}>
        <button
          type="button"
          className={`${styles.key} ${styles.enter}`}
          onClick={submitGuess}
          aria-label="Submit guess"
        >
          Enter
        </button>
        {ROW3.split('').map(renderKey)}
        <button
          type="button"
          className={`${styles.key} ${styles.backspace}`}
          onClick={removeLetter}
          aria-label="Backspace"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
