import { getStoredStats } from '../lib/storage';
import styles from './StatsModal.module.css';

interface StatsModalProps {
  onClose: () => void;
}

export function StatsModal({ onClose }: StatsModalProps) {
  const stats = getStoredStats();
  const totalPlayed = stats.results.length;
  const totalWins = stats.results.filter((r) => r.won).length;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  stats.results.filter((r) => r.won).forEach((r) => { distribution[r.attempts] = (distribution[r.attempts] ?? 0) + 1; });
  const maxDist = Math.max(1, ...Object.values(distribution));

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Statistics">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Statistics</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.section}>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{totalPlayed}</span>
              <span className={styles.statLabel}>Played</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{totalWins ? Math.round((totalWins / totalPlayed) * 100) : 0}%</span>
              <span className={styles.statLabel}>Win rate</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{stats.currentStreak}</span>
              <span className={styles.statLabel}>Current streak</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{stats.maxStreak}</span>
              <span className={styles.statLabel}>Max streak</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Guess distribution</h3>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className={styles.distRow}>
              <span className={styles.distLabel}>{n}</span>
              <div className={styles.distBarBg}>
                <div
                  className={styles.distBar}
                  style={{ width: `${maxDist ? (distribution[n] / maxDist) * 100 : 0}%` }}
                />
              </div>
              <span className={styles.distCount}>{distribution[n] ?? 0}</span>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Daily leaderboard</h3>
          <p className={styles.placeholder}>Leaderboard requires a server. Connect your backend to show daily rankings.</p>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Monthly leaderboard</h3>
          <p className={styles.placeholder}>Leaderboard requires a server. Connect your backend to show monthly rankings.</p>
        </div>
      </div>
    </div>
  );
}
