export const BOARD_COLUMNS = 14;
export const BOARD_ROWS = 10;
export const BOARD_TILE_COUNT = BOARD_COLUMNS * BOARD_ROWS;

const TILE_BASE_PATH = '/images/tiles';

export const TILE_DISTRIBUTION = [
  { file: '侦探咪宝.png', count: 6 },
  { file: '咪宝抱树.png', count: 6 },
  { file: '困困咪宝.png', count: 6 },
  { file: '头绳.png', count: 6 },
  { file: '开心咪宝.png', count: 6 },
  { file: '毛线球.png', count: 6 },
  { file: '潜水员咪宝.png', count: 6 },
  { file: '猫爪.png', count: 6 },
  { file: '猫爬架.png', count: 6 },
  { file: '猫砂盆.png', count: 6 },
  { file: '猫粮罐头.png', count: 6 },
  { file: '猫罐头.png', count: 6 },
  { file: '猫薄荷球.png', count: 6 },
  { file: '玩具收纳.png', count: 6 },
  { file: '玩水咪宝.png', count: 6 },
  { file: '生气咪宝.png', count: 6 },
  { file: '裹被子的咪宝.png', count: 6 },
  { file: '躲盒子里的咪宝.png', count: 6 },
  { file: '迷惑咪宝.png', count: 6 },
  { file: '震惊咪宝.png', count: 6 },
  { file: '面包趴咪宝.png', count: 6 },
  { file: '鱼.png', count: 6 },
  { file: '拍屁股的咪宝.png', count: 4 },
  { file: '博士帽咪宝.png', count: 4 },
];

export function generateBoard(distribution = TILE_DISTRIBUTION) {
  validateDistribution(distribution);

  const tiles = distribution.flatMap(({ file, count }) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${file}-${index}`,
      name: file.replace('.png', ''),
      file,
      src: `${TILE_BASE_PATH}/${encodeURIComponent(file)}`,
      removed: false,
    })),
  );

  return shuffle(tiles).map((tile, index) => ({
    ...tile,
    id: `${tile.id}-${index}`,
    index,
    row: Math.floor(index / BOARD_COLUMNS),
    column: index % BOARD_COLUMNS,
  }));
}

export function validateDistribution(distribution) {
  const totalTiles = distribution.reduce((sum, tile) => sum + tile.count, 0);
  const hasOddCount = distribution.some((tile) => tile.count % 2 !== 0);

  if (distribution.length !== 24) {
    throw new Error(`Expected 24 tile images, received ${distribution.length}.`);
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
