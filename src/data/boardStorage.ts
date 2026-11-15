import type { Edge } from "@xyflow/react";
import type { NoteNode } from "@/components/card/BoardNoteNode";
import seed from "./board.json";

type BoardSnapshot = {
  nodes: Pick<NoteNode, "id" | "type" | "position" | "data">[];
  edges: Edge[];
};

const storageKey = "plot.board.v1";

const seedBoard: BoardSnapshot = {
  nodes: seed.nodes.map(({ type, ...node }) => {
    if (type !== "note") throw new Error(`Unknown node type: ${type}`);
    return { ...node, type };
  }),
  edges: seed.edges,
};

export function loadBoard(): BoardSnapshot {
  try {
    const raw = localStorage.getItem(storageKey);
    const saved = raw ? (JSON.parse(raw) as BoardSnapshot | null) : null;

    if (saved && Array.isArray(saved.nodes) && Array.isArray(saved.edges)) {
      return saved;
    }
  } catch (error: unknown) {
    console.warn(
      // TODO: Given time add a toast error.
      "Could not load the saved board. Using the starter board.",
      error,
    );
  }

  return seedBoard;
}

export function saveBoard(board: BoardSnapshot) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(board));
  } catch (error: unknown) {
    console.warn(
      // TODO: Given time add a toast error.
      "Could not save the board. Changes may be lost on reload.",
      error,
    );
  }
}
