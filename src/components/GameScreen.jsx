import { useMemo, useState } from 'react';
import GameBoard from './GameBoard.jsx';
import Modal from './Modal.jsx';
import TopBar from './TopBar.jsx';
import { generateBoard } from '../logic/board.js';
import { levels } from '../logic/levels.js';

export default function GameScreen() {
  const [activeModal, setActiveModal] = useState(null);
  const level = levels[0];
  const tiles = useMemo(() => generateBoard(), []);

  return (
    <main className="screen game-screen">
      <TopBar
        level={level}
        timeLabel="08:00"
        onHint={() => setActiveModal('hint')}
        onShuffle={() => setActiveModal('shuffle')}
        onSettings={() => setActiveModal('settings')}
      />
      <section className="game-stage" aria-label="游戏棋盘">
        <GameBoard tiles={tiles} rows={level.rows} columns={level.columns} />
      </section>
      <Modal
        type={activeModal}
        open={Boolean(activeModal)}
        onClose={() => setActiveModal(null)}
      />
    </main>
  );
}
