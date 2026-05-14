import { TILE_IMAGES } from './tileAssets.js';

export const BOARD_COLUMNS = 14;
export const BOARD_ROWS = 10;
export const BOARD_TILE_COUNT = BOARD_COLUMNS * BOARD_ROWS;

const TILE_BASE_PATH = '/images/tiles';

export function generateBoard(level) {
  const selectedImages = TILE_IMAGES.slice(0, level.tileSetSize);
  const distribution = createTileDistribution(selectedImages);
  validateDistribution(distribution, level.tileSetSize);

  const tiles = distribution.flatMap(({ file, count }) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${file}-${index}`,
      name: file.replace('.png', ''),
      file,
      src: `${TILE_BASE_PATH}/${file}`,
      removed: false,
    })),
  );

  const generatedTiles = shuffle(tiles).map((tile, index) => ({
    ...tile,
    id: `${tile.id}-${index}`,
    index,
    row: Math.floor(index / BOARD_COLUMNS),
    column: index % BOARD_COLUMNS,
  }));

  console.log('Generating board', {
    levelLabel: level.levelLabel,
    title: level.title,
    tileSetSize: level.tileSetSize,
    actualTileImageCount: selectedImages.length,
    totalTiles: generatedTiles.length,
    totalNonEmptyTileCount: generatedTiles.filter((tile) => !tile.removed).length,
  });
  console.table(distribution.map(({ file, count }) => ({
    file,
    count,
  })));

  return generatedTiles;
}

export function createTileDistribution(selectedImages) {
  if (selectedImages.length === 24) {
    return selectedImages.map((file, index) => ({
      file,
      count: index < 22 ? 6 : 4,
    }));
  }

  if (selectedImages.length === 28) {
    return selectedImages.map((file, index) => ({
      file,
      count: index < 14 ? 6 : 4,
    }));
  }

  throw new Error(`Unsupported tile set size: ${selectedImages.length}.`);
}

export function validateDistribution(distribution, expectedImageCount) {
  const totalTiles = distribution.reduce((sum, tile) => sum + tile.count, 0);
  const hasOddCount = distribution.some((tile) => tile.count % 2 !== 0);

  if (distribution.length !== expectedImageCount) {
    throw new Error(`Expected ${expectedImageCount} tile images, received ${distribution.length}.`);
  }

  if (totalTiles !== BOARD_TILE_COUNT) {
    throw new Error(`Expected ${BOARD_TILE_COUNT} tiles, received ${totalTiles}.`);
  }

  if (hasOddCount) {
    throw new Error('Every tile image count must be even.');
  }
}

export function shuffle(items) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

export function shuffleRemainingTiles(tiles) {
  const remainingTiles = shuffle(tiles.filter((tile) => !tile.removed));
  let nextTileIndex = 0;

  return tiles.map((tile) => {
    if (tile.removed) {
      return tile;
    }

    const nextTile = remainingTiles[nextTileIndex];
    nextTileIndex += 1;

    return {
      ...nextTile,
      index: tile.index,
      row: tile.row,
      column: tile.column,
    };
  });
}

export function applyMovementRule(board, movementRule, rows = BOARD_ROWS, columns = BOARD_COLUMNS) {
  if (movementRule === 'none') {
    return board.map((tile) => ({ ...tile }));
  }

  if (movementRule === 'splitUpDown') {
    return splitUpDown(board, rows, columns);
  }

  if (movementRule === 'splitLeftRight') {
    return splitLeftRight(board, rows, columns);
  }

  if (movementRule === 'gravityDown') {
    return gravityDown(board, rows, columns);
  }

  if (movementRule === 'alignRight') {
    return alignRight(board, rows, columns);
  }

  if (movementRule === 'collapseToHorizon') {
    return collapseToHorizon(board, rows, columns);
  }

  if (movementRule === 'collapseToCenterLine') {
    return collapseToCenterLine(board, rows, columns);
  }

  return board.map((tile) => ({ ...tile }));
}

// Top half tiles move upward per column; bottom half tiles move downward.
// Relative order is preserved, leaving empty cells gathered near the middle.
function splitUpDown(board, rows, columns) {
  const topEnd = Math.floor(rows / 2) - 1;
  const bottomStart = topEnd + 1;
  const nextBoard = createEmptyBoard(rows, columns);

  for (let column = 0; column < columns; column += 1) {
    const topTiles = collectTiles(board, 0, topEnd, column, column, columns);
    const bottomTiles = collectTiles(board, bottomStart, rows - 1, column, column, columns);

    placeTiles(nextBoard, topTiles, topTiles.map((_, offset) => ({
      row: offset,
      column,
    })), columns);

    placeTiles(nextBoard, bottomTiles, bottomTiles.map((_, offset) => ({
      row: rows - bottomTiles.length + offset,
      column,
    })), columns);
  }

  return nextBoard;
}

// Left half tiles move left per row; right half tiles move right.
// Relative order is preserved, leaving empty cells gathered near the middle.
function splitLeftRight(board, rows, columns) {
  const leftEnd = Math.floor(columns / 2) - 1;
  const rightStart = leftEnd + 1;
  const nextBoard = createEmptyBoard(rows, columns);

  for (let row = 0; row < rows; row += 1) {
    const leftTiles = collectTiles(board, row, row, 0, leftEnd, columns);
    const rightTiles = collectTiles(board, row, row, rightStart, columns - 1, columns);

    placeTiles(nextBoard, leftTiles, leftTiles.map((_, offset) => ({
      row,
      column: offset,
    })), columns);

    placeTiles(nextBoard, rightTiles, rightTiles.map((_, offset) => ({
      row,
      column: columns - rightTiles.length + offset,
    })), columns);
  }

  return nextBoard;
}

// Gravity moves remaining tiles downward in each column.
// Relative top-to-bottom order is preserved, leaving empty cells at the top.
function gravityDown(board, rows, columns) {
  const nextBoard = createEmptyBoard(rows, columns);

  for (let column = 0; column < columns; column += 1) {
    const columnTiles = collectTiles(board, 0, rows - 1, column, column, columns);

    placeTiles(nextBoard, columnTiles, columnTiles.map((_, offset) => ({
      row: rows - columnTiles.length + offset,
      column,
    })), columns);
  }

  return nextBoard;
}

// Remaining tiles in each row move right.
// Relative left-to-right order is preserved, leaving empty cells at the left.
function alignRight(board, rows, columns) {
  const nextBoard = createEmptyBoard(rows, columns);

  for (let row = 0; row < rows; row += 1) {
    const rowTiles = collectTiles(board, row, row, 0, columns - 1, columns);

    placeTiles(nextBoard, rowTiles, rowTiles.map((_, offset) => ({
      row,
      column: columns - rowTiles.length + offset,
    })), columns);
  }

  return nextBoard;
}

// Top half tiles move down and bottom half tiles move up toward the horizon.
// Relative top-to-bottom order is preserved within each half.
function collapseToHorizon(board, rows, columns) {
  const topEnd = Math.floor(rows / 2) - 1;
  const bottomStart = topEnd + 1;
  const nextBoard = createEmptyBoard(rows, columns);

  for (let column = 0; column < columns; column += 1) {
    const topTiles = collectTiles(board, 0, topEnd, column, column, columns);
    const bottomTiles = collectTiles(board, bottomStart, rows - 1, column, column, columns);

    placeTiles(nextBoard, topTiles, topTiles.map((_, offset) => ({
      row: topEnd - topTiles.length + 1 + offset,
      column,
    })), columns);

    placeTiles(nextBoard, bottomTiles, bottomTiles.map((_, offset) => ({
      row: bottomStart + offset,
      column,
    })), columns);
  }

  return nextBoard;
}

// Left half tiles move right and right half tiles move left toward the center.
// Relative left-to-right order is preserved within each half.
function collapseToCenterLine(board, rows, columns) {
  const leftEnd = Math.floor(columns / 2) - 1;
  const rightStart = leftEnd + 1;
  const nextBoard = createEmptyBoard(rows, columns);

  for (let row = 0; row < rows; row += 1) {
    const leftTiles = collectTiles(board, row, row, 0, leftEnd, columns);
    const rightTiles = collectTiles(board, row, row, rightStart, columns - 1, columns);

    placeTiles(nextBoard, leftTiles, leftTiles.map((_, offset) => ({
      row,
      column: leftEnd - leftTiles.length + 1 + offset,
    })), columns);

    placeTiles(nextBoard, rightTiles, rightTiles.map((_, offset) => ({
      row,
      column: rightStart + offset,
    })), columns);
  }

  return nextBoard;
}

function collectTiles(board, startRow, endRow, startColumn, endColumn, columns) {
  const tiles = [];

  for (let row = startRow; row <= endRow; row += 1) {
    for (let column = startColumn; column <= endColumn; column += 1) {
      const tile = board[getIndex(row, column, columns)];

      if (tile && !tile.removed) {
        tiles.push(tile);
      }
    }
  }

  return tiles;
}

function placeTiles(nextBoard, tiles, positions, columns) {
  tiles.forEach((tile, tileIndex) => {
    const position = positions[tileIndex];
    const index = getIndex(position.row, position.column, columns);

    nextBoard[index] = moveTileToPosition(tile, position.row, position.column, columns);
  });
}

function createEmptyBoard(rows, columns) {
  return Array.from({ length: rows * columns }, (_, index) => ({
    id: `empty-${index}`,
    name: '',
    file: '',
    src: '',
    removed: true,
    index,
    row: Math.floor(index / columns),
    column: index % columns,
  }));
}

function moveTileToPosition(tile, row, column, columns) {
  return {
    ...tile,
    removed: false,
    index: getIndex(row, column, columns),
    row,
    column,
  };
}

function getIndex(row, column, columns) {
  return row * columns + column;
}
