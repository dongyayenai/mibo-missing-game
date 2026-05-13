import Tile from './Tile.jsx';

export default function GameBoard({
  tiles,
  rows,
  columns,
  selectedTileId,
  highlightedTileIds,
  invalidTileIds,
  isPaused,
  onTileClick,
}) {
  return (
    <div
      className="game-board"
      style={{
        '--board-rows': rows,
        '--board-columns': columns,
      }}
    >
      {tiles.map((tile) => (
        <Tile
          key={tile.index}
          tile={tile}
          selected={selectedTileId === tile.id}
          highlighted={highlightedTileIds.includes(tile.id)}
          invalid={invalidTileIds.includes(tile.id)}
          hidden={isPaused}
          onClick={() => onTileClick(tile)}
        />
      ))}
    </div>
  );
}
