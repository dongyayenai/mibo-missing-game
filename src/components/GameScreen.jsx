import { useEffect, useMemo, useState } from 'react';
import GameBoard from './GameBoard.jsx';
import Modal from './Modal.jsx';
import TopBar from './TopBar.jsx';
import { playSound } from '../logic/audio.js';
import {
  applyMovementRule,
  generateBoard,
  getTilePoolForLevel,
  refillEmptyCells,
  shuffleRemainingTiles,
} from '../logic/board.js';
import { DIFFICULTY_PRESETS, formatSeconds } from '../logic/difficulty.js';
import { findHint, hasAvailableMove } from '../logic/hint.js';
import { levels } from '../logic/levels.js';
import { findPath } from '../logic/pathFinding.js';

function isPortraitViewport() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(orientation: portrait)').matches;
}

function getShuffleLimitForLevel(level, difficulty) {
  return difficulty.shuffleLimit + (level.shuffleBonus ?? 0);
}

function shouldShowLevelIntro(level) {
  return level.id === 9;
}

function shouldRefillLevel9(clearedTileCount, nextRefillAt) {
  return clearedTileCount >= nextRefillAt;
}

function isLevel9(level) {
  return level.id === 9;
}

export default function GameScreen({
  selectedDifficulty,
  soundEnabled,
  onSoundEnabledChange,
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
  const [isPortrait, setIsPortrait] = useState(() => isPortraitViewport());
  const level = levels[currentLevelIndex];
  const isFinalLevel = currentLevelIndex === levels.length - 1;
  const difficulty = DIFFICULTY_PRESETS[selectedDifficulty] ?? DIFFICULTY_PRESETS.normal;
  const [tiles, setTiles] = useState(() => generateBoard(levels[0]));
  const [timeRemaining, setTimeRemaining] = useState(difficulty.timeLimitSeconds);
  const [hintRemaining, setHintRemaining] = useState(difficulty.hintLimit);
  const [shuffleRemaining, setShuffleRemaining] = useState(() => (
    getShuffleLimitForLevel(levels[0], difficulty)
  ));
  const [clearedTileCount, setClearedTileCount] = useState(0);
  const [nextRefillAt, setNextRefillAt] = useState(20);
  const [rescueUsed, setRescueUsed] = useState(false);
  const [refillToast, setRefillToast] = useState('');
  const [isLevelActuallyStarted, setIsLevelActuallyStarted] = useState(() => (
    !shouldShowLevelIntro(levels[0])
  ));
  const clearCountTarget = level.targetClearedTiles ?? 0;
  const progressLabel = level.goalType === 'clearCount'
    ? `404：${Math.min(clearedTileCount, clearCountTarget)}/${clearCountTarget}`
    : null;

  const modalConfig = useMemo(() => {
    if (activeModal === 'level-intro') {
      return {
        title: '最终挑战：404！',
        message: '咪宝会不断换地方躲起来。\n\n每找到 20 个线索，就会出现一批新的图案。\n\n累计找到 404 个格子，就能找到咪宝！',
        actions: [
          { label: '开始挑战', onClick: () => {
            playSound('click', soundEnabled);
            setIsLevelActuallyStarted(true);
            setActiveModal(null);
          } },
        ],
      };
    }

    if (activeModal === 'time-over') {
      return {
        title: '时间到啦',
        message: '咪宝又躲起来了……',
        actions: [
          { label: '重新开始', onClick: () => restartLevel() },
          { label: '回到首页', onClick: () => returnHome() },
        ],
      };
    }

    if (activeModal === 'rescue') {
      return {
        title: '还要继续找咪宝吗？',
        message: '404 挑战还没结束。\n要不要增加 5 分钟和 5 次洗牌？',
        actions: [
          { label: '继续挑战', onClick: () => continueChallenge() },
          { label: '重新开始', onClick: () => restartLevel() },
          { label: '回到首页', onClick: () => returnHome() },
        ],
      };
    }

    if (activeModal === 'game-over') {
      return {
        title: '没有可以找到的咪宝了',
        message: '没有可以连接的咪宝，也没有洗牌次数啦。再找一次吧？',
        actions: [
          { label: '重新开始', onClick: () => restartLevel() },
          { label: '回到首页', onClick: () => returnHome() },
        ],
      };
    }

    if (activeModal === 'win') {
      const useLevelWinCopy = level.goalType === 'clearCount';

      return {
        title: useLevelWinCopy || !isFinalLevel ? level.winTitle : '找到咪宝啦！',
        message: useLevelWinCopy || !isFinalLevel ? level.winMessage : '咪宝终于出来啦！\n今天也辛苦你啦 🐾',
        rewardIcon: useLevelWinCopy || !isFinalLevel ? level.rewardIcon : '开心咪宝.png',
        variant: isFinalLevel ? 'final-win' : 'win',
        actions: isFinalLevel
          ? [
            { label: '再玩一次', onClick: () => restartLevel() },
            { label: '回到首页', onClick: () => returnHome() },
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
        message: '咪宝先躲好啦，回来再继续游戏。',
        actions: [
          { label: '继续游戏', onClick: () => {
            playSound('click', soundEnabled);
            setIsPaused(false);
            setActiveModal(null);
          } },
          { label: `音效：${soundEnabled ? '开' : '关'}`, onClick: () => {
            playSound('click', soundEnabled);
            onSoundEnabledChange((current) => !current);
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
    onSoundEnabledChange,
    selectedDifficulty,
    soundEnabled,
  ]);

  useEffect(() => {
    if (!isLevelActuallyStarted || isPaused || isPortrait || activeModal || timeRemaining <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setTimeRemaining((currentTime) => Math.max(currentTime - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [activeModal, isLevelActuallyStarted, isPaused, isPortrait, timeRemaining]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const updateOrientation = () => {
      setIsPortrait(mediaQuery.matches);
    };

    updateOrientation();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateOrientation);
      return () => mediaQuery.removeEventListener('change', updateOrientation);
    }

    mediaQuery.addListener(updateOrientation);
    return () => mediaQuery.removeListener(updateOrientation);
  }, []);

  useEffect(() => {
    if (
      !isLevel9(level)
      || !isLevelActuallyStarted
      || rescueUsed
      || activeModal
      || isPaused
      || isPortrait
      || timeRemaining > 30
      || timeRemaining <= 0
    ) {
      return;
    }

    setActiveModal('rescue');
  }, [
    activeModal,
    isLevelActuallyStarted,
    isPaused,
    isPortrait,
    level,
    rescueUsed,
    timeRemaining,
  ]);

  useEffect(() => {
    if (
      !isLevel9(level)
      || !isLevelActuallyStarted
      || activeModal
      || isPaused
      || isPortrait
      || shuffleRemaining !== 0
    ) {
      return;
    }

    const remainingTiles = tiles.filter((tile) => !tile.removed);
    const hasMove = remainingTiles.length >= 2
      && hasAvailableMove(tiles, level.rows, level.columns);

    if (hasMove) {
      return;
    }

    if (!rescueUsed) {
      setActiveModal('rescue');
      return;
    }

    playSound('gameOver', soundEnabled);
    setActiveModal('game-over');
  }, [
    activeModal,
    isLevelActuallyStarted,
    isPaused,
    isPortrait,
    level,
    rescueUsed,
    shuffleRemaining,
    soundEnabled,
    tiles,
  ]);

  useEffect(() => {
    if (isLevelActuallyStarted && timeRemaining === 0 && !activeModal && !timeOverAcknowledged) {
      setActiveModal('time-over');
    }
  }, [activeModal, isLevelActuallyStarted, timeOverAcknowledged, timeRemaining]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setMessage(''), 2000);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  useEffect(() => {
    if (!refillToast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setRefillToast(''), 1500);

    return () => window.clearTimeout(timeoutId);
  }, [refillToast]);

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key !== '9' || event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (
        event.target instanceof HTMLElement
        && (
          ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)
          || event.target.isContentEditable
        )
      ) {
        return;
      }

      const level9Index = levels.findIndex((candidateLevel) => candidateLevel.id === 9);

      if (level9Index === -1) {
        return;
      }

      event.preventDefault();
      startLevel(level9Index);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDifficulty, soundEnabled]);

  function resetLevelState(nextLevel, nextDifficulty = difficulty) {
    playSound('click', soundEnabled);
    setTiles(generateBoard(nextLevel));
    setTimeRemaining(nextDifficulty.timeLimitSeconds);
    setHintRemaining(nextDifficulty.hintLimit);
    setShuffleRemaining(getShuffleLimitForLevel(nextLevel, nextDifficulty));
    setClearedTileCount(0);
    setNextRefillAt(nextLevel.refillEveryClearedTiles ?? 20);
    setRescueUsed(false);
    setRefillToast('');
    setIsLevelActuallyStarted(!shouldShowLevelIntro(nextLevel));
    setSelectedTileId(null);
    setHighlightedTileIds([]);
    setInvalidTileIds([]);
    setTimeOverAcknowledged(false);
    setIsPaused(false);
    setMessage('');
    setActiveModal(shouldShowLevelIntro(nextLevel) ? 'level-intro' : null);
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
    if (!isLevelActuallyStarted || isPortrait || activeModal) {
      return;
    }

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
    setClearedTileCount(0);
    setNextRefillAt(20);
    setRescueUsed(false);
    setRefillToast('');
    setIsLevelActuallyStarted(true);
    onBackHome();
  }

  function checkNoMove(nextTiles, nextShuffleRemaining = shuffleRemaining) {
    const remainingTiles = nextTiles.filter((tile) => !tile.removed);
    const hasMove = remainingTiles.length >= 2
      && hasAvailableMove(nextTiles, level.rows, level.columns);

    if (hasMove) {
      return;
    }

    if (nextShuffleRemaining > 0) {
      return;
    }

    if (isLevel9(level) && !rescueUsed) {
      setActiveModal('rescue');
      return;
    }

    playSound('gameOver', soundEnabled);
    setActiveModal('game-over');
  }

  function continueChallenge() {
    playSound('click', soundEnabled);
    setRescueUsed(true);
    setTimeRemaining((currentTime) => currentTime + 300);
    setShuffleRemaining((currentCount) => currentCount + 5);
    setActiveModal(null);
  }

  function handleTileClick(tile) {
    if (!isLevelActuallyStarted || isPaused || isPortrait || tile.removed || activeModal) {
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

    if (level.goalType === 'clearCount') {
      handleClearCountMatch(nextTiles);
      return;
    }

    const movedTiles = applyMovementRule(nextTiles, level.movementRule, level.rows, level.columns);

    setTiles(movedTiles);
    playSound('match', soundEnabled);
    setSelectedTileId(null);
    setHighlightedTileIds([]);
    setInvalidTileIds([]);
    if (movedTiles.every((item) => item.removed)) {
      playSound(isFinalLevel ? 'finalWin' : 'win', soundEnabled);
      setActiveModal('win');
      return;
    }
    checkNoMove(movedTiles);
  }

  function handleClearCountMatch(nextTiles) {
    const nextClearedTileCount = clearedTileCount + 2;

    setClearedTileCount(nextClearedTileCount);
    playSound('match', soundEnabled);
    setSelectedTileId(null);
    setHighlightedTileIds([]);
    setInvalidTileIds([]);

    if (nextClearedTileCount >= level.targetClearedTiles) {
      setTiles(nextTiles);
      playSound('finalWin', soundEnabled);
      setActiveModal('win');
      return;
    }

    if (shouldRefillLevel9(nextClearedTileCount, nextRefillAt)) {
      const refilledTiles = refillEmptyCells(
        nextTiles,
        level.refillBatchSize,
        getTilePoolForLevel(level),
      );
      const refillStep = level.refillEveryClearedTiles ?? level.refillBatchSize;

      setTiles(refilledTiles);
      setNextRefillAt(nextRefillAt + refillStep);
      setTimeRemaining((currentTime) => currentTime + 60);
      setHintRemaining((currentCount) => currentCount + 2);
      setRefillToast('新的线索出现了！+1分钟，+2提示');
      checkNoMove(refilledTiles);
      return;
    }

    setTiles(nextTiles);
    checkNoMove(nextTiles);
  }

  function handleHint() {
    if (!isLevelActuallyStarted || isPaused || isPortrait) {
      return;
    }

    if (hintRemaining === 0) {
      playSound('click', soundEnabled);
      setMessage('没有提示次数啦');
      return;
    }

    const hint = findHint(tiles, level.rows, level.columns);

    if (!hint) {
      setMessage('可以尝试洗牌');
      setSelectedTileId(null);
      setHighlightedTileIds([]);
      setInvalidTileIds([]);
      return;
    }

    playSound('hint', soundEnabled);
    setHintRemaining((currentCount) => currentCount - 1);
    setHighlightedTileIds(hint.map((tile) => tile.id));
    window.setTimeout(() => setHighlightedTileIds([]), 2000);
  }

  function handleShuffle() {
    if (!isLevelActuallyStarted || isPaused || isPortrait) {
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
      <div className="game-stage">
        <img className="game-bg" src="/images/backgrounds/game.png" alt="" draggable="false" />
        <TopBar
          level={level}
          timeLabel={formatSeconds(timeRemaining)}
          hintRemaining={hintRemaining}
          shuffleRemaining={shuffleRemaining}
          progressLabel={progressLabel}
          actionsDisabled={!isLevelActuallyStarted || isPaused || isPortrait || Boolean(activeModal)}
          onHint={handleHint}
          onShuffle={handleShuffle}
          onSettings={pauseGame}
        />
        {message && <div className="game-message" role="status">{message}</div>}
        {refillToast && <div className="refill-toast" role="status">{refillToast}</div>}
        <section
          className={['board-stage', isPortrait ? 'board-stage--orientation-blocked' : '']
            .filter(Boolean)
            .join(' ')}
          aria-label="游戏棋盘"
          aria-hidden={isPortrait}
        >
          <GameBoard
            tiles={tiles}
            rows={level.rows}
            columns={level.columns}
            selectedTileId={selectedTileId}
            highlightedTileIds={highlightedTileIds}
            invalidTileIds={invalidTileIds}
            isPaused={isPaused || isPortrait}
            onTileClick={handleTileClick}
          />
          {isPaused && <div className="board-pause-overlay">暂停中</div>}
        </section>
        {isPortrait && (
          <div className="orientation-overlay" role="status" aria-live="polite">
            <div className="orientation-overlay__content">
              <div className="orientation-overlay__icon" aria-hidden="true">🐾</div>
              <h2>请横屏游玩</h2>
              <p>咪宝藏得有点多，把 iPad 横过来会更舒服哦。</p>
            </div>
          </div>
        )}
        <div className="small-screen-message">
          这一关咪宝藏得有点多，用 iPad 或横屏玩会更舒服哦。
        </div>
      </div>
      {modalConfig && (
        <Modal
          open={Boolean(modalConfig)}
          title={modalConfig.title}
          message={modalConfig.message}
          rewardIcon={modalConfig.rewardIcon}
          variant={modalConfig.variant}
          actions={modalConfig.actions}
          onClose={modalConfig.onClose}
        >
          {modalConfig.content}
        </Modal>
      )}
    </main>
  );
}
