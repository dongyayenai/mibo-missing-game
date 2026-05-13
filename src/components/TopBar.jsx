export default function TopBar({
  level,
  timeLabel,
  hintRemaining,
  shuffleRemaining,
  actionsDisabled,
  onHint,
  onShuffle,
  onSettings,
}) {
  return (
    <header className="top-bar">
      <div className="top-bar__title">咪宝不见啦！</div>
      <div className="top-bar__level">{level.levelLabel}：{level.title}</div>
      <div className="top-bar__right">
        <div className="top-bar__timer">⏱ {timeLabel}</div>
        <nav className="top-bar__actions" aria-label="游戏操作">
          <button
            type="button"
            onClick={onHint}
            aria-disabled={hintRemaining === 0}
            disabled={actionsDisabled}
          >
            提示 ×{hintRemaining}
          </button>
          <button
            type="button"
            onClick={onShuffle}
            aria-disabled={shuffleRemaining === 0}
            disabled={actionsDisabled}
          >
            洗牌 ×{shuffleRemaining}
          </button>
          <button type="button" onClick={onSettings}>暂停</button>
        </nav>
      </div>
    </header>
  );
}
