import { canConnect } from './pathFinding.js';

export function findHint(tiles) {
  for (let firstIndex = 0; firstIndex < tiles.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < tiles.length; secondIndex += 1) {
      if (canConnect(tiles[firstIndex], tiles[secondIndex])) {
        return [tiles[firstIndex], tiles[secondIndex]];
      }
    }
  }

  return null;
}
