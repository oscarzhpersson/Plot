import seed from "./board.json";
import { boardSchema, type BoardSnapshot, type BoardSnapshotInput } from "./boardSchema";

const storageKey = "plot.board.v1";
const seedBoard = boardSchema.parse(seed);

export function loadBoard(): BoardSnapshot {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw !== null) return boardSchema.parse(JSON.parse(raw));
  } catch (error: unknown) {
    console.warn(
      "Could not load the saved board. Using the starter board.",
      error,
    );
  }

  return seedBoard;
}

export function saveBoard(board: BoardSnapshotInput) {
  try {
    const snapshot = boardSchema.parse(board);
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch (error: unknown) {
    console.warn(
      "Could not save the board. Changes may be lost on reload.",
      error,
    );
  }
}
