import { BOARD_COLUMNS, BOARD_ROWS } from './board.js';

const DIRECTIONS = [
  { row: -1, column: 0 },
  { row: 0, column: 1 },
  { row: 1, column: 0 },
  { row: 0, column: -1 },
];

export function canConnect(tileA, tileB) {
  if (!tileA || !tileB || tileA.id === tileB.id || tileA.removed || tileB.removed) {
    return false;
  }

  return tileA.file === tileB.file;
}

export function findPath(board, tileA, tileB, rows = BOARD_ROWS, columns = BOARD_COLUMNS) {
  if (!canConnect(tileA, tileB)) {
    return null;
  }

  const start = toSearchPoint(tileA);
  const target = toSearchPoint(tileB);
  const blockedCells = getBlockedCells(board, tileA, tileB);
  const maxRow = rows + 1;
  const maxColumn = columns + 1;
  const queue = [{ ...start, direction: -1, turns: 0, path: [start] }];
  const visited = new Map();

  while (queue.length > 0) {
    const current = queue.shift();

    for (let direction = 0; direction < DIRECTIONS.length; direction += 1) {
      const next = {
        row: current.row + DIRECTIONS[direction].row,
        column: current.column + DIRECTIONS[direction].column,
      };
      const turns = current.direction === -1 || current.direction === direction
        ? current.turns
        : current.turns + 1;

      if (
        turns > 2
        || next.row < 0
        || next.row > maxRow
        || next.column < 0
        || next.column > maxColumn
      ) {
        continue;
      }

      if (!isSamePoint(next, target) && blockedCells.has(pointKey(next))) {
        continue;
      }

      const visitedKey = `${next.row},${next.column},${direction}`;

      if (visited.has(visitedKey) && visited.get(visitedKey) <= turns) {
        continue;
      }

      const path = [...current.path, next];

      if (isSamePoint(next, target)) {
        return path;
      }

      visited.set(visitedKey, turns);
      queue.push({ ...next, direction, turns, path });
    }
  }

  return null;
}

function getBlockedCells(board, tileA, tileB) {
  return new Set(
    board
      .filter((tile) => !tile.removed && tile.id !== tileA.id && tile.id !== tileB.id)
      .map((tile) => pointKey(toSearchPoint(tile))),
  );
}

function toSearchPoint(tile) {
  return {
    row: tile.row + 1,
    column: tile.column + 1,
  };
}

function isSamePoint(pointA, pointB) {
  return pointA.row === pointB.row && pointA.column === pointB.column;
}

function pointKey(point) {
  return `${point.row},${point.column}`;
}
