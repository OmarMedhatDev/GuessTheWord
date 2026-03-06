/**
 * Local storage for daily play and stats (one game per day per player).
 */

const KEY_STATS = 'guess-word-stats';

export interface DayResult {
  date: string; // YYYY-MM-DD
  attempts: number;
  won: boolean;
}

export interface StoredStats {
  lastPlayedDate: string;
  results: DayResult[];
  currentStreak: number;
  maxStreak: number;
}

function loadStats(): StoredStats {
  try {
    const raw = localStorage.getItem(KEY_STATS);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredStats;
      return {
        lastPlayedDate: parsed.lastPlayedDate ?? '',
        results: Array.isArray(parsed.results) ? parsed.results : [],
        currentStreak: typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0,
        maxStreak: typeof parsed.maxStreak === 'number' ? parsed.maxStreak : 0,
      };
    }
  } catch {
    // ignore
  }
  return {
    lastPlayedDate: '',
    results: [],
    currentStreak: 0,
    maxStreak: 0,
  };
}

function saveStats(stats: StoredStats): void {
  try {
    localStorage.setItem(KEY_STATS, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function hasPlayedToday(): boolean {
  const stats = loadStats();
  const today = new Date().toISOString().slice(0, 10);
  return stats.lastPlayedDate === today;
}

export function recordResult(dateKey: string, attempts: number, won: boolean): void {
  const stats = loadStats();
  const existing = stats.results.find((r) => r.date === dateKey);
  if (existing) return; // already recorded for this day

  stats.results.push({ date: dateKey, attempts, won });
  stats.results.sort((a, b) => a.date.localeCompare(b.date));
  stats.lastPlayedDate = dateKey;

  // Current streak: consecutive days with a win going backward from today
  let currentStreak = 0;
  let check = dateKey;
  for (let i = 0; i < 365; i++) {
    const r = stats.results.find((x) => x.date === check);
    if (r?.won) currentStreak++;
    else break;
    const d = new Date(check + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() - 1);
    check = d.toISOString().slice(0, 10);
  }
  stats.currentStreak = currentStreak;
  stats.maxStreak = Math.max(stats.maxStreak, currentStreak);
  saveStats(stats);
}

export function getStoredStats(): StoredStats {
  return loadStats();
}

export function getTodayResult(): DayResult | null {
  const today = new Date().toISOString().slice(0, 10);
  return loadStats().results.find((r) => r.date === today) ?? null;
}
