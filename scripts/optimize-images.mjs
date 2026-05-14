import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const tileDir = path.join(rootDir, 'public/images/tiles');
const backgroundDir = path.join(rootDir, 'public/images/backgrounds');
const tileMaxSize = 512;
const backgroundMaxWidth = 1366;

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes}B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function listPngFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
    .map((entry) => path.join(directory, entry.name));
}

async function optimizePng(filePath, pipeline) {
  const before = await fs.stat(filePath);
  const beforeMetadata = await sharp(filePath).metadata();
  const tempPath = `${filePath}.tmp`;

  await pipeline(sharp(filePath))
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: true,
      quality: 88,
      effort: 10,
    })
    .toFile(tempPath);

  await fs.rename(tempPath, filePath);

  const after = await fs.stat(filePath);
  const afterMetadata = await sharp(filePath).metadata();

  return {
    file: path.relative(rootDir, filePath),
    beforeSize: before.size,
    afterSize: after.size,
    beforeDimensions: `${beforeMetadata.width}x${beforeMetadata.height}`,
    afterDimensions: `${afterMetadata.width}x${afterMetadata.height}`,
  };
}

function printResult(result) {
  console.log(
    `${result.file}: ${result.beforeDimensions} ${formatBytes(result.beforeSize)} -> `
      + `${result.afterDimensions} ${formatBytes(result.afterSize)}`,
  );
}

async function main() {
  const tileFiles = await listPngFiles(tileDir);
  const backgroundFiles = await listPngFiles(backgroundDir);
  const results = [];

  for (const filePath of tileFiles) {
    const result = await optimizePng(filePath, (image) => image.resize({
      width: tileMaxSize,
      height: tileMaxSize,
      fit: 'inside',
      withoutEnlargement: true,
    }));
    results.push(result);
    printResult(result);
  }

  for (const filePath of backgroundFiles) {
    const result = await optimizePng(filePath, (image) => image.resize({
      width: backgroundMaxWidth,
      withoutEnlargement: true,
    }));
    results.push(result);
    printResult(result);
  }

  const beforeTotal = results.reduce((sum, result) => sum + result.beforeSize, 0);
  const afterTotal = results.reduce((sum, result) => sum + result.afterSize, 0);

  console.log(`Optimized ${results.length} images.`);
  console.log(`Total image bytes: ${formatBytes(beforeTotal)} -> ${formatBytes(afterTotal)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
