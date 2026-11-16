import { Hand, MessageCircle } from "lucide-react";

import type { BoardTool } from "../boardTypes";

export type BoardActionControlProps = {
  current: BoardTool;
  onToolChange: (tool: BoardTool) => void;
};

export default function BoardActionControls({
  current,
  onToolChange,
}: BoardActionControlProps) {
  return (
    <>
      <button
        type="button"
        title="Pan"
        aria-label="Pan"
        aria-pressed={current === "pan"}
        onClick={() => onToolChange("pan")}
        className="plot-toolbar-button nopan inline-flex h-8.5 touch-none items-center gap-2 whitespace-nowrap px-3 text-sm font-medium"
      >
        <Hand
          size={16}
          strokeWidth={1.75}
          className="plot-toolbar-icon"
          aria-hidden="true"
        />
        Pan
      </button>
      <button
        type="button"
        title="Comment"
        aria-label="Comment"
        aria-pressed={current === "comment"}
        onClick={() => onToolChange("comment")}
        className="plot-toolbar-button nopan inline-flex h-8.5 touch-none items-center gap-2 whitespace-nowrap px-3 text-sm font-medium"
      >
        <MessageCircle
          size={16}
          strokeWidth={1.75}
          className="plot-toolbar-icon"
          aria-hidden="true"
        />
        Comment
      </button>
    </>
  );
}
