import { useState, useEffect, useRef } from 'react';
import type { DiscordSDK } from '@discord/embedded-app-sdk';
import { DiscordProvider } from './context/DiscordContext';
import { useGameState } from './hooks/useGameState';
import { GameBoard } from './components/GameBoard';
import { Keyboard } from './components/Keyboard';
import { Sidebar } from './components/Sidebar';
import { StatsModal } from './components/StatsModal';
import styles from './App.module.css';

// ─── Confetti burst ───────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#6aaa64', '#c9b458', '#4a90d9', '#e45858', '#9b59b6', '#f39c12'];

function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = Array.from({ length: 28 }, (_, i) => {
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const left = `${Math.random() * 100}%`;
    const delay = `${Math.random() * 0.4}s`;
    const size = `${6 + Math.random() * 6}px`;
    const rotate = `${Math.random() * 360}deg`;
    return { color, left, delay, size, rotate, key: i };
  });

  return (
    <div className={styles.confettiWrapper} aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.key}
          className="confetti-piece"
          style={{
            left: p.left,
            top: '-10px',
            background: p.color,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Toast overlay ────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  variant?: 'error' | 'win';
  onHidden: () => void;
}

function Toast({ message, variant = 'error', onHidden }: ToastProps) {
  const [hiding, setHiding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // For error toasts auto-dismiss; win toast stays until next state
    if (variant === 'error') {
      timerRef.current = setTimeout(() => setHiding(true), 1400);
    }
    return () => clearTimeout(timerRef.current);
  }, [message, variant]);

  const handleAnimEnd = () => {
    if (hiding) onHidden();
  };

  return (
    <div
      className={`toast${variant === 'win' ? ' win' : ''}${hiding ? ' hiding' : ''}`}
      onAnimationEnd={handleAnimEnd}
      aria-live="assertive"
    >
      {message}
    </div>
  );
}

// ─── Stats icon ───────────────────────────────────────────────────────────────
function StatsIcon({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className={styles.statsIcon}
      onClick={onClick}
      aria-label="Statistics and leaderboard"
      title="Statistics"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    </button>
  );
}

// ─── Main game content ────────────────────────────────────────────────────────
function AppContent() {
  const game = useGameState();
  const [statsOpen, setStatsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Toast state: message and variant
  const [toast, setToast] = useState<{ text: string; variant: 'error' | 'win'; key: number } | null>(null);
  const toastKeyRef = useRef(0);

  // Show toasts when game.message changes
  const prevMessage = useRef<string | null>(null);
  useEffect(() => {
    if (game.message && game.message !== prevMessage.current) {
      toastKeyRef.current += 1;
      setToast({
        text: game.message,
        variant: game.status === 'won' ? 'win' : 'error',
        key: toastKeyRef.current,
      });
      if (game.status === 'won') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1800);
      }
    }
    prevMessage.current = game.message;
  }, [game.message, game.status]);

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Guess the Word</h1>
            <p className={styles.instructions}>
              Guess the 5-letter word in 5 tries. Gray = not in word, yellow = wrong place, green = correct.
            </p>
          </div>
          <div className={styles.headerRight}>
            <StatsIcon onClick={() => setStatsOpen(true)} />
          </div>
        </header>

        {game.hasPlayedTodayAlready ? (
          <div className={styles.alreadyPlayed}>
            <p className={styles.alreadyPlayedTitle}>You've already played today</p>
            <p className={styles.alreadyPlayedSub}>
              {game.savedTodayResult?.won
                ? `You got it in ${game.savedTodayResult.attempts}/5.`
                : "You didn't get today's word. See you tomorrow!"}
            </p>
            <p className={styles.alreadyPlayedHint}>Come back tomorrow for a new daily word.</p>
          </div>
        ) : (
          <>
            {/* Board area wrapper for toast positioning */}
            <div className={styles.boardArea}>
              {/* Toast floats above the grid, no layout shift */}
              {toast && (
                <Toast
                  key={toast.key}
                  message={toast.text}
                  variant={toast.variant}
                  onHidden={() => setToast(null)}
                />
              )}
              <ConfettiBurst active={showConfetti} />

              <GameBoard
                guesses={game.guesses}
                currentGuess={game.currentGuess}
                maxAttempts={game.maxAttempts}
                shakeRow={game.shakeRow}
                onShakeDone={game.clearShake}
              />
            </div>

            <Keyboard
              addLetter={game.addLetter}
              removeLetter={game.removeLetter}
              submitGuess={game.submitGuess}
              guesses={game.guesses}
              status={game.status}
            />
          </>
        )}
      </main>

      {statsOpen && <StatsModal onClose={() => setStatsOpen(false)} />}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
interface AppProps {
  discordSdk: DiscordSDK | null;
}

export default function App({ discordSdk }: AppProps) {
  return (
    <DiscordProvider sdk={discordSdk} currentUser={null}>
      <AppContent />
    </DiscordProvider>
  );
}
