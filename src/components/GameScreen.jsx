import { useEffect, useMemo, useState } from 'react';
import GameBoard from './GameBoard.jsx';
import Modal from './Modal.jsx';
import TopBar from './TopBar.jsx';
import { playSound } from '../logic/audio.js';
import { applyMovementRule, generateBoard, shuffleRemainingTiles } from '../logic/board.js';
import { DIFFICULTY_PRESETS, formatSeconds } from '../logic/difficulty.js';
import { findHint, hasAvailableMove } from '../logic/hint.js';
import { levels } from '../logic/levels.js';
import { findPath } from '../logic/pathFinding.js';

export default function GameScreen({
  selectedDifficulty,
  onBackHome,
}) {
  const [activeModal, setActiveModal] = useState(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [selectedTileId, setSelectedTileId] = useState(null);
  const [highlightedTileIds, setHighlightedTileIds] = useState([]);
  const [invalidTileIds, setInvalidTileIds] = useState([]);
  const [timeOverAcknowledged, setTimeOverAcknowledged] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const level = levels[currentLevelIndex];
  const isFinalLevel = currentLevelIndex === levels.length - 1;
  const difficulty = DIFFICULTY_PRESETS[selectedDifficulty] ?? DIFFICULTY_PRESETS.normal;
  const [tiles, setTiles] = useState(() => generateBoard(levels[0]));
  const [timeRemaining, setTimeRemaining] = useState(difficulty.timeLimitSeconds);
  const [hintRemaining, setHintRemaining] = useState(difficulty.hintLimit);
  const [shuffleRemaining, setShuffleRemaining] = useState(difficulty.shuffleLimit);

  const modalConfig = useMemo(() => {
    if (activeModal === 'time-over') {
      return {
        title: '时间到啦',
        message: '咪宝又躲起来了……',
        actions: [
          { label: '继续找', onClick: () => {
            playSound('click', soundEnabled);
            setTimeOverAcknowledged(true);
            setActiveModal(null);
          } },
          { label: '重新开始', onClick: () => restartLevel() },
        ],
      };
    }

    if (activeModal === 'game-over') {
      return {
        title: '没有路可以找到咪宝啦',
        message: '咪宝又躲起来了，再找一次吧？',
        actions: [
          { label: '重新开始', onClick: () => restartLevel() },
          { label: '回到首页', onClick: () => returnHome() },
        ],
      };
    }

    if (activeModal === 'win') {
      return {
        title: level.winTitle,
        message: level.winMessage,
        rewardIcon: level.rewardIcon,
        actions: isFinalLevel
          ? [
            { label: '回到首页', onClick: () => returnHome() },
            { label: '再玩一次', onClick: () => restartLevel() },
          ]
          : [
            { label: '下一关', onClick: () => startLevel(currentLevelIndex + 1) },
            { label: '再玩一次', onClick: () => restartLevel() },
          ],
      };
    }

    if (activeModal === 'pause') {
      return {
        title: '暂停中',
        message: '咪宝先躲好啦，回来再继续找。',
        actions: [
          { label: '继续游戏', onClick: () => {
            playSound('click', soundEnabled);
            setIsPaused(false);
            setActiveModal(null);
          } },
          { label: `音效：${soundEnabled ? '开' : '关'}`, onClick: () => {
            playSound('click', soundEnabled);
            setSoundEnabled((current) => !current);
          } },
          { label: '重新开始', onClick: () => restartLevel() },
          { label: '回到首页', onClick: () => returnHome() },
        ],
      };
    }

    return null;
  }, [
    activeModal,
    currentLevelIndex,
    isFinalLevel,
    level,
    onBackHome,
    selectedDifficulty,
    soundEnabled,
  ]);

  useEffect(() => {
    if (isPaused || activeModal || timeRemaining <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setTimeRemaining((currentTime) => Math.max(currentTime - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [activeModal, isPaused, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && !activeModal && !timeOverAcknowledged) {
      setActiveModal('time-over');
    }
  }, [activeModal, timeOverAcknowledged, timeRemaining]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setMessage(''), 2000);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  function resetLevelState(nextLevel, nextDifficulty = difficulty) {
    playSound('click', soundEnabled);
    setTiles(generateBoard(nextLevel));
    setTimeRemaining(nextDifficulty.timeLimitSeconds);
    setHintRemaining(nextDifficulty.hintLimit);
    setShuffleRemaining(nextDifficulty.shuffleLimit);
    setSelectedTileId(null);
    setHighlightedTileIds([]);
    setInvalidTileIds([]);
    setTimeOverAcknowledged(false);
    setIsPaused(false);
    setMessage('');
    setActiveModal(null);
  }

  function restartLevel() {
    const nextDifficulty = DIFFICULTY_PRESETS[selectedDifficulty] ?? DIFFICULTY_PRESETS.normal;
    resetLevelState(level, nextDifficulty);
  }

  function startLevel(nextLevelIndex) {
    const nextDifficulty = DIFFICULTY_PRESETS[selectedDifficulty] ?? DIFFICULTY_PRESETS.normal;
    setCurrentLevelIndex(nextLevelIndex);
    resetLevelState(levels[nextLevelIndex], nextDifficulty);
  }

  function pauseGame() {
    playSound('click', soundEnabled);
    setIsPaused(true);
    setSelectedTileId(null);
    setHighlightedTileIds([]);
    setInvalidTileIds([]);
    setMessage('');
    setActiveModal('pause');
  }

  function returnHome() {
    playSound('click', soundEnabled);
    setIsPaused(false);
    setActiveModal(null);
    onBackHome();
  }

  function checkNoMove(nextTiles, nextShuffleRemaining = shuffleRemaining) {
    const remainingTiles = nextTiles.filter((tile) => !tile.removed);

    if (remainingTiles.length < 2 || hasAvailableMove(nextTiles, level.rows, level.columns)) {
      return;
    }

    if (nextShuffleRemaining > 0) {
      const shuffledTiles = shuffleRemainingTiles(nextTiles);
      playSound('shuffle', soundEnabled);
      setTiles(shuffledTiles);
      setShuffleRemaining(nextShuffleRemaining - 1);
      setMessage('咪宝们换了个位置');

      if (!hasAvailableMove(shuffledTiles, level.rows, level.columns)) {
        checkNoMove(shuffledTiles, nextShuffleRemaining - 1);
      }

      return;
    }

    playSound('gameOver', soundEnabled);
    setActiveModal('game-over');
  }

  function handleTileClick(tile) {
    if (isPaused || tile.removed || activeModal) {
      return;
    }

    const selectedTile = tiles.find((item) => item.id === selectedTileId);

    if (!selectedTile) {
      playSound('click', soundEnabled);
      setSelectedTileId(tile.id);
      return;
    }

    if (selectedTile.id === tile.id) {
      playSound('click', soundEnabled);
      setSelectedTileId(null);
      return;
    }

    if (selectedTile.file !== tile.file) {
      playSound('click', soundEnabled);
      setSelectedTileId(tile.id);
      return;
    }

    const path = findPath(tiles, selectedTile, tile, level.rows, level.columns);

    if (!path) {
      playSound('wrong', soundEnabled);
      setInvalidTileIds([selectedTile.id, tile.id]);
      setSelectedTileId(null);
      window.setTimeout(() => setInvalidTileIds([]), 350);
      return;
    }

    const nextTiles = tiles.map((item) => (
      item.id === selectedTile.id || item.id === tile.id
        ? { ...item, removed: true }
        : item
    ));
    const movedTiles = applyMovementRule(nextTiles, level.movementRule, level.rows, level.columns);

    setTiles(movedTiles);
    playSound('match', soundEnabled);
    setSelectedTileId(null);
    setHighlightedTileIds([]);
    setInvalidTileIds([]);
    if (movedTiles.every((item) => item.removed)) {
      playSound('win', soundEnabled);
      setActiveModal('win');
      return;
    }
    checkNoMove(movedTiles);
  }

  function handleHint() {
    if (isPaused) {
      return;
    }

    if (hintRemaining === 0) {
      playSound('click', soundEnabled);
      setMessage('没有提示次数啦');
      return;
    }

    const hint = findHint(tiles, level.rows, level.columns);

    if (!hint) {
      checkNoMove(tiles);
      return;
    }

    playSound('hint', soundEnabled);
    setHintRemaining((currentCount) => currentCount - 1);
    setHighlightedTileIds(hint.map((tile) => tile.id));
    window.setTimeout(() => setHighlightedTileIds([]), 2000);
  }

  function handleShuffle() {
    if (isPaused) {
      return;
    }

    if (shuffleRemaining === 0) {
      playSound('click', soundEnabled);
      setMessage('没有洗牌次数啦');
      return;
    }

    const nextTiles = shuffleRemainingTiles(tiles);
    const nextShuffleRemaining = shuffleRemaining - 1;

    setTiles(nextTiles);
    playSound('shuffle', soundEnabled);
    setSelectedTileId(null);
    setHighlightedTileIds([]);
    setInvalidTileIds([]);
    setShuffleRemaining(nextShuffleRemaining);
    checkNoMove(nextTiles, nextShuffleRemaining);
  }

  return (
    <main className="screen game-screen">
      <TopBar
        level={level}
        timeLabel={formatSeconds(timeRemaining)}
        hintRemaining={hintRemaining}
        shuffleRemaining={shuffleRemaining}
        actionsDisabled={isPaused}
        onHint={handleHint}
        onShuffle={handleShuffle}
        onSettings={pauseGame}
      />
      {message && <div className="game-message" role="status">{message}</div>}
      <section className="game-stage" aria-label="游戏棋盘">
        <GameBoard
          tiles={tiles}
          rows={level.rows}
          columns={level.columns}
          selectedTileId={selectedTileId}
          highlightedTileIds={highlightedTileIds}
          invalidTileIds={invalidTileIds}
          isPaused={isPaused}
          onTileClick={handleTileClick}
        />
        {isPaused && <div className="board-pause-overlay">暂停中</div>}
      </section>
      {modalConfig && (
        <Modal
          open={Boolean(modalConfig)}
          title={modalConfig.title}
          message={modalConfig.message}
          rewardIcon={modalConfig.rewardIcon}
          actions={modalConfig.actions}
          onClose={modalConfig.onClose}
        >
          {modalConfig.content}
        </Modal>
      )}
    </main>
  );
}
