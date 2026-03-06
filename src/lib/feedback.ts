/**
 * Wordle-style feedback: gray = not in word, yellow = wrong position, green = correct.
 * Handles duplicate letters correctly (only as many yellows as occurrences in target).
 */
export type FeedbackState = 'gray' | 'yellow' | 'green';

export function computeFeedback(guess: string, target: string): FeedbackState[] {
  const g = guess.toLowerCase().split('');
  const t = target.toLowerCase().split('');
  const result: FeedbackState[] = ['gray', 'gray', 'gray', 'gray', 'gray'];

  // First pass: mark greens
  const targetUsed: boolean[] = [false, false, false, false, false];
  for (let i = 0; i < 5; i++) {
    if (g[i] === t[i]) {
      result[i] = 'green';
      targetUsed[i] = true;
    }
  }

  // Second pass: mark yellows (letter in word but wrong position)
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'green') continue;
    for (let j = 0; j < 5; j++) {
      if (!targetUsed[j] && g[i] === t[j]) {
        result[i] = 'yellow';
        targetUsed[j] = true;
        break;
      }
    }
  }

  return result;
}
