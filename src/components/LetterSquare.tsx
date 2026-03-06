import { useEffect, useRef, useState } from 'react';
import type { FeedbackState } from '../lib/feedback';
import styles from './LetterSquare.module.css';

interface LetterSquareProps {
  letter: string;
  state?: FeedbackState | 'empty';
  flipDelay?: number; // ms delay for staggered flip
  animatePop?: boolean;
}

export function LetterSquare({ letter, state = 'empty', flipDelay = 0, animatePop = false }: LetterSquareProps) {
  const [displayState, setDisplayState] = useState<FeedbackState | 'empty'>('empty');
  const [flipping, setFlipping] = useState(false);
  const [popping, setPopping] = useState(false);
  const prevLetter = useRef('');

  // Pop animation when a new letter is typed
  useEffect(() => {
    if (animatePop && letter && letter !== prevLetter.current) {
      setPopping(true);
      const t = setTimeout(() => setPopping(false), 120);
      prevLetter.current = letter;
      return () => clearTimeout(t);
    }
    prevLetter.current = letter;
  }, [letter, animatePop]);

  // Flip reveal animation when state changes from 'empty' to a result
  useEffect(() => {
    if (state !== 'empty' && displayState === 'empty') {
      const flipTimer = setTimeout(() => {
        setFlipping(true);
        const midTimer = setTimeout(() => {
          setDisplayState(state);
          setFlipping(false);
        }, 250);
        return () => clearTimeout(midTimer);
      }, flipDelay);
      return () => clearTimeout(flipTimer);
    }
    if (state === 'empty') {
      setDisplayState('empty');
    }
  }, [state, flipDelay]);

  const classNames = [
    styles.square,
    styles[displayState],
    flipping ? styles.flip : '',
    popping ? styles.pop : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={classNames}
      role="img"
      aria-label={state === 'empty' ? 'Empty' : `${letter} ${state}`}
    >
      {letter}
    </span>
  );
}
