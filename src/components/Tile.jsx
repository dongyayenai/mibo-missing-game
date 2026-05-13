import { useState } from 'react';

export default function Tile({ tile, selected, highlighted, invalid, hidden, onClick }) {
  const [imageMissing, setImageMissing] = useState(false);

  if (tile.removed) {
    return <div className="tile tile--empty" aria-hidden="true" />;
  }

  const src = tile.src;

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
      {!hidden && !imageMissing && (
        <img
          src={src}
          alt=""
          draggable="false"
          onError={() => {
            console.error('Tile image failed to render:', src);
            setImageMissing(true);
          }}
        />
      )}
      {!hidden && imageMissing && (
        <span className="tile__missing">{tile.file}</span>
      )}
    </button>
  );
}
