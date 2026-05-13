import { DIFFICULTY_OPTIONS, formatSeconds } from '../logic/difficulty.js';

export default function DifficultySelector({
  selectedDifficulty,
  onSelectDifficulty,
  helperText,
}) {
  return (
    <div className="difficulty-selector">
      {helperText && <p className="difficulty-selector__helper">{helperText}</p>}
      <div className="difficulty-options" role="radiogroup" aria-label="选择难度">
        {DIFFICULTY_OPTIONS.map((difficulty) => (
          <button
            key={difficulty.id}
            className={[
              'difficulty-option',
              selectedDifficulty === difficulty.id ? 'difficulty-option--selected' : '',
            ].filter(Boolean).join(' ')}
            type="button"
            role="radio"
            aria-checked={selectedDifficulty === difficulty.id}
            onClick={() => onSelectDifficulty(difficulty.id)}
          >
            <span className="difficulty-option__label">{difficulty.label}</span>
            <span className="difficulty-option__meta">
              {formatSeconds(difficulty.timeLimitSeconds)}｜提示 ×{difficulty.hintLimit}｜洗牌 ×{difficulty.shuffleLimit}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
