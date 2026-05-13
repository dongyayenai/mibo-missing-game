import { useState } from 'react';
import DifficultySelector from './DifficultySelector.jsx';
import { playSound, SOUND_FILES } from '../logic/audio.js';
import { preloadAudio, preloadImages } from '../logic/preload.js';
import { TILE_IMAGES } from '../logic/tileAssets.js';

const PRELOAD_TIMEOUT_MS = 1500;
const GAME_BACKGROUND_URL = '/images/backgrounds/game.png';
const TILE_URLS = TILE_IMAGES.map((file) => `/images/tiles/${file}`);
const AUDIO_URLS = Object.values(SOUND_FILES);

function waitForImagesWithTimeout() {
  const preloadTask = preloadImages([
    GAME_BACKGROUND_URL,
    ...TILE_URLS,
  ]);
  const timeoutTask = new Promise((resolve) => {
    window.setTimeout(resolve, PRELOAD_TIMEOUT_MS);
  });

  return Promise.race([preloadTask, timeoutTask]);
}

function preloadSounds() {
  void preloadAudio(AUDIO_URLS);
}

export default function HomeScreen({
  selectedDifficulty,
  soundEnabled,
  onDifficultyChange,
  onStart,
}) {
  const [difficultyModalOpen, setDifficultyModalOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const openDifficultyModal = () => {
    playSound('click', soundEnabled);
    preloadSounds();
    setDifficultyModalOpen(true);
  };

  const handleDifficultyChange = (difficulty) => {
    playSound('click', soundEnabled);
    onDifficultyChange(difficulty);
  };

  const handleStart = async () => {
    if (isStarting) {
      return;
    }

    setIsStarting(true);
    playSound('click', soundEnabled);
    preloadSounds();
    console.log('Preload started');
    await waitForImagesWithTimeout();
    console.log('Image preload finished or timed out');
    setIsStarting(false);
    console.log('Loading cleared');
    console.log('Starting Level 1');
    onStart();
  };

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
              onSelectDifficulty={handleDifficultyChange}
            />
            <div className="modal__actions">
              <button
                className="primary-button"
                type="button"
                disabled={isStarting}
                onClick={handleStart}
              >
                {isStarting ? '咪宝正在藏起来……' : '开始寻找'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
