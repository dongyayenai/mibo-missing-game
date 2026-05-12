export default function Tile({ tile }) {
  return (
    <button className="tile" type="button" aria-label={tile.name}>
      <img src={tile.src} alt="" draggable="false" />
    </button>
  );
}
