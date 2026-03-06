import { useDiscord } from '../context/DiscordContext';
import { MiniGrid } from './MiniGrid';
import styles from './Sidebar.module.css';

export function Sidebar() {
  const { participants } = useDiscord();

  return (
    <aside className={styles.sidebar}>
      <button type="button" className={styles.inviteBtn} aria-label="Invite friends">
        <span className={styles.inviteIcon}>+</span>
        <span>Invite friends</span>
      </button>

      <div className={styles.playingNow}>
        <h3 className={styles.playingTitle}>Playing now</h3>
        {participants.length === 0 ? (
          <p className={styles.empty}>When friends join this activity, you’ll see their progress here.</p>
        ) : (
          <ul className={styles.participantList}>
            {participants.map((p) => (
              <li key={p.userId} className={styles.participant}>
                <div className={styles.participantAvatar}>
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt="" width={32} height={32} />
                  ) : (
                    <span className={styles.avatarPlaceholder}>{p.username.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.participantGrid}>
                  <MiniGrid guesses={p.guesses} maxRows={6} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
