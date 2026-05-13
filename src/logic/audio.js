const AUDIO_VOLUME = 0.35;

const SOUND_FILES = {
  click: '/audio/click.mp3',
  match: '/audio/match.mp3',
  wrong: '/audio/wrong.mp3',
  shuffle: '/audio/shuffle.mp3',
  hint: '/audio/hint.mp3',
  win: '/audio/win.mp3',
  gameOver: '/audio/game-over.mp3',
};

export function playSound(name, soundEnabled) {
  if (!soundEnabled || !SOUND_FILES[name]) {
    return;
  }

  try {
    const audio = new Audio(SOUND_FILES[name]);
    audio.volume = AUDIO_VOLUME;
    const playPromise = audio.play();

    if (playPromise) {
      playPromise.catch(() => {});
    }
  } catch {
    // Missing or blocked audio should never interrupt gameplay.
  }
}
