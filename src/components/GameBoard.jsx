import Tile from './Tile.jsx';

export default function GameBoard({ tiles, rows, columns }) {
  return (
    <div
      className="game-board"
      style={{
        '--board-rows': rows,
        '--board-columns': columns,
      }}
    >
      {tiles.map((tile) => (
        <Tile key={tile.id} tile={tile} />
      ))}
    </div>
  );
}
