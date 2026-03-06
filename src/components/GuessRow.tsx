import type { FeedbackState } from '../lib/feedback';
import { LetterSquare } from './LetterSquare';

interface GuessRowProps {
  word: string;
  feedback?: FeedbackState[];
  isActive?: boolean;   // true = this is the row the player is currently typing into
  shake?: boolean;      // trigger shake animation
  onShakeDone?: () => void;
}

export function GuessRow({ word, feedback, isActive = false, shake = false, onShakeDone }: GuessRowProps) {
  const letters = word.padEnd(5, ' ').slice(0, 5).split('');

  const rowClass = ['guess-row', shake ? 'shake' : ''].filter(Boolean).join(' ');

  return (
    <div
      className={rowClass}
      role="group"
      aria-label="Guess row"
      onAnimationEnd={shake ? onShakeDone : undefined}
    >
      {letters.map((letter, i) => (
        <LetterSquare
          key={i}
          letter={letter.trim()}
          state={feedback?.[i] ?? 'empty'}
          flipDelay={feedback ? i * 80 : 0}
          animatePop={isActive}
        />
      ))}
    </div>
  );
}
