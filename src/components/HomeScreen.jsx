export default function HomeScreen({ onStart }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onStart();
    }
  };

  return (
    <main
      className="screen home-screen"
      role="button"
      tabIndex={0}
      aria-label="开始游戏"
      onClick={onStart}
      onKeyDown={handleKeyDown}
    >
    </main>
  );
}
