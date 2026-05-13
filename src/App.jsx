import { useState } from 'react';
import HomeScreen from './components/HomeScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import { DIFFICULTY_PRESETS } from './logic/difficulty.js';

const SCREENS = {
  HOME: 'home',
  GAME: 'game',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [selectedDifficulty, setSelectedDifficulty] = useState(DIFFICULTY_PRESETS.normal.id);
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (screen === SCREENS.GAME) {
    return (
      <GameScreen
        selectedDifficulty={selectedDifficulty}
        soundEnabled={soundEnabled}
        onSoundEnabledChange={setSoundEnabled}
        onBackHome={() => setScreen(SCREENS.HOME)}
      />
    );
  }

  return (
    <HomeScreen
      selectedDifficulty={selectedDifficulty}
      soundEnabled={soundEnabled}
      onDifficultyChange={setSelectedDifficulty}
      onStart={() => setScreen(SCREENS.GAME)}
    />
  );
}
