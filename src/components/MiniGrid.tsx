import type { FeedbackState } from '../lib/feedback';
import styles from './MiniGrid.module.css';

export interface MiniGuess {
  word: string;
  feedback: FeedbackState[];
}

interface MiniGridProps {
  guesses: MiniGuess[];
  maxRows?: number;
}

const COLORS: Record<FeedbackState | 'empty', string> = {
  gray: '#787c7e',
  yellow: '#c9b458',
  green: '#6aaa64',
  empty: '#d3d6da',
};

export function MiniGrid({ guesses, maxRows = 6 }: MiniGridProps) {
  const rows: { word: string; feedback?: FeedbackState[] }[] = [];
  guesses.forEach((g) => rows.push({ word: g.word, feedback: g.feedback }));
  while (rows.length < maxRows) rows.push({ word: '' });

  return (
    <div className={styles.miniGrid} role="img" aria-label="Mini guess grid">
      {rows.slice(0, maxRows).map((row, ri) => (
        <div key={ri} className={styles.miniRow}>
          {[0, 1, 2, 3, 4].map((ci) => {
            const letter = row.word[ci] ?? '';
            const state = row.feedback?.[ci] ?? 'empty';
            const color = COLORS[state];
            return (
              <span
                key={ci}
                className={styles.miniCell}
                style={{ background: letter ? color : 'transparent' }}
                title={letter ? `${letter} ${state}` : ''}
              >
                {letter}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
