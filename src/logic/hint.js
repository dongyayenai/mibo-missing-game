import { findPath } from './pathFinding.js';

export function findHint(tiles, rows, columns) {
  for (let firstIndex = 0; firstIndex < tiles.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < tiles.length; secondIndex += 1) {
      if (findPath(tiles, tiles[firstIndex], tiles[secondIndex], rows, columns)) {
        return [tiles[firstIndex], tiles[secondIndex]];
      }
    }
  }

  return null;
}

export function hasAvailableMove(tiles, rows, columns) {
  return Boolean(findHint(tiles, rows, columns));
}
