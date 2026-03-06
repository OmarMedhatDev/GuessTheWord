import styles from './GameMessage.module.css';

interface GameMessageProps {
  message: string | null;
  status: 'playing' | 'won' | 'lost';
  onPlayAgain?: () => void;
}

export function GameMessage({ message, status, onPlayAgain }: GameMessageProps) {
  if (!message && status === 'playing') return null;

  const isGameOver = status === 'won' || status === 'lost';

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      {message && <p className={styles.message}>{message}</p>}
      {isGameOver && onPlayAgain && (
        <button
          type="button"
          className={styles.playAgain}
          onClick={onPlayAgain}
          aria-label="Play again"
        >
          Play again
        </button>
      )}
    </div>
  );
}
