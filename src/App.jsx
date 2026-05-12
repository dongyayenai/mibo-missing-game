import { useState } from 'react';
import HomeScreen from './components/HomeScreen.jsx';
import GameScreen from './components/GameScreen.jsx';

const SCREENS = {
  HOME: 'home',
  GAME: 'game',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);

  if (screen === SCREENS.GAME) {
    return <GameScreen onBackHome={() => setScreen(SCREENS.HOME)} />;
  }

  return <HomeScreen onStart={() => setScreen(SCREENS.GAME)} />;
}
