export const DIFFICULTY_PRESETS = {
  easy: {
    id: 'easy',
    label: '轻松',
    timeLimitSeconds: 480,
    hintLimit: 8,
    shuffleLimit: 6,
  },
  normal: {
    id: 'normal',
    label: '普通',
    timeLimitSeconds: 300,
    hintLimit: 5,
    shuffleLimit: 4,
  },
  hard: {
    id: 'hard',
    label: '挑战',
    timeLimitSeconds: 210,
    hintLimit: 3,
    shuffleLimit: 2,
  },
};

export const DIFFICULTY_OPTIONS = [
  DIFFICULTY_PRESETS.easy,
  DIFFICULTY_PRESETS.normal,
  DIFFICULTY_PRESETS.hard,
];

export function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${seconds}`;
}
