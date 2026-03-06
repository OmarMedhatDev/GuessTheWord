import { GuessRow } from './GuessRow';
import type { useGameState } from '../hooks/useGameState';
import styles from './GameBoard.module.css';

type GameState = ReturnType<typeof useGameState>;

interface GameBoardProps {
  guesses: GameState['guesses'];
  currentGuess: GameState['currentGuess'];
  maxAttempts: number;
  shakeRow: number | null;   // index of the row to shake
  onShakeDone: () => void;
}

export function GameBoard({ guesses, currentGuess, maxAttempts, shakeRow, onShakeDone }: GameBoardProps) {
  const rows: { word: string; feedback?: import('../lib/feedback').FeedbackState[] }[] = [];

  guesses.forEach((g) => {
    rows.push({ word: g.word, feedback: g.feedback });
  });

  const activeRowIndex = guesses.length;

  if (guesses.length < maxAttempts) {
    rows.push({ word: currentGuess });
  }

  while (rows.length < maxAttempts) {
    rows.push({ word: '' });
  }

  return (
    <div className={styles.board} role="grid" aria-label="Guess grid">
      {rows.map((row, i) => (
        <GuessRow
          key={i}
          word={row.word}
          feedback={row.feedback}
          isActive={i === activeRowIndex && !row.feedback}
          shake={shakeRow === i}
          onShakeDone={shakeRow === i ? onShakeDone : undefined}
        />
      ))}
    </div>
  );
}
