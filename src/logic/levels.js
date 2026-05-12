import { BOARD_COLUMNS, BOARD_ROWS } from './board.js';

export const levels = [
  { id: 1, rows: BOARD_ROWS, columns: BOARD_COLUMNS, timeLimitSeconds: 480, theme: 'home' },
  { id: 2, rows: BOARD_ROWS, columns: BOARD_COLUMNS, timeLimitSeconds: 450, theme: 'living-room' },
  { id: 3, rows: BOARD_ROWS, columns: BOARD_COLUMNS, timeLimitSeconds: 420, theme: 'kitchen' },
  { id: 4, rows: BOARD_ROWS, columns: BOARD_COLUMNS, timeLimitSeconds: 390, theme: 'bedroom' },
  { id: 5, rows: BOARD_ROWS, columns: BOARD_COLUMNS, timeLimitSeconds: 360, theme: 'garden' },
  { id: 6, rows: BOARD_ROWS, columns: BOARD_COLUMNS, timeLimitSeconds: 330, theme: 'finale' },
];
