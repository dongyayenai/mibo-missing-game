export default function Tile({ tile, selected, highlighted, invalid, hidden, onClick }) {
  if (tile.removed) {
    return <div className="tile tile--empty" aria-hidden="true" />;
  }

  return (
    <button
      className={[
        'tile',
        selected ? 'tile--selected' : '',
        highlighted ? 'tile--highlighted' : '',
        invalid ? 'tile--invalid' : '',
      ].filter(Boolean).join(' ')}
      type="button"
      aria-label={tile.name}
      disabled={hidden}
      onClick={onClick}
    >
      {!hidden && <img src={tile.src} alt="" draggable="false" />}
    </button>
  );
}
