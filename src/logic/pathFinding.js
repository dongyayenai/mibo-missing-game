export function canConnect(tileA, tileB) {
  if (!tileA || !tileB || tileA.id === tileB.id) {
    return false;
  }

  return tileA.file === tileB.file;
}
