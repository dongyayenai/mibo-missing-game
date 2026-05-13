import { useState } from 'react';
import DifficultySelector from './DifficultySelector.jsx';

export default function HomeScreen({
  selectedDifficulty,
  onDifficultyChange,
  onStart,
}) {
  const [difficultyModalOpen, setDifficultyModalOpen] = useState(false);

  const openDifficultyModal = () => setDifficultyModalOpen(true);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDifficultyModal();
    }
  };

  return (
    <main
      className="screen home-screen"
      role="button"
      tabIndex={0}
      aria-label="开始游戏"
      onClick={openDifficultyModal}
      onKeyDown={handleKeyDown}
    >
      {difficultyModalOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={(event) => event.stopPropagation()}
        >
          <section
            className="modal modal--difficulty"
            role="dialog"
            aria-modal="true"
            aria-labelledby="difficulty-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="difficulty-title">选择难度</h2>
            <p>先决定今天怎么找咪宝吧。</p>
            <DifficultySelector
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={onDifficultyChange}
            />
            <div className="modal__actions">
              <button className="primary-button" type="button" onClick={onStart}>
                开始寻找
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
