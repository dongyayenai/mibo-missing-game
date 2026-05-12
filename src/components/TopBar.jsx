export default function TopBar({
  level,
  timeLabel,
  onHint,
  onShuffle,
  onSettings,
}) {
  return (
    <header className="top-bar">
      <div className="top-bar__title">咪宝不见啦！</div>
      <div className="top-bar__level">第 {level.id} 关：咪宝去哪儿了？</div>
      <div className="top-bar__right">
        <div className="top-bar__timer">⏱ {timeLabel}</div>
        <nav className="top-bar__actions" aria-label="游戏操作">
          <button type="button" onClick={onHint}>提示</button>
          <button type="button" onClick={onShuffle}>洗牌</button>
          <button type="button" onClick={onSettings}>设置</button>
        </nav>
      </div>
    </header>
  );
}
