import { Panel } from "@xyflow/react";
import { Hand } from "lucide-react";
import type { BoardTool } from "@/types/Board.type";

import BoardZoomControls from "./BoardZoomControls";

export type BoardToolbarProps = {
  tool: BoardTool;
  onToolChange: (tool: BoardTool) => void;
};

export default function BoardToolbar() {
  return (
    <Panel
      position="bottom-center"
      className="flex items-center gap-0.75 rounded-xl border border-plot-border bg-plot-surface text-plot-text p-1.25 shadow select-none"
    >
      <button
        type="button"
        title="Pan"
        aria-label="Pan"
        className="plot-toolbar-button nopan grid h-8.5 w-8 touch-none place-items-center"
      >
        <Hand
          size={16}
          strokeWidth={1.75}
          className="plot-toolbar-icon"
          aria-hidden="true"
        />
        Pan
      </button>
      <BoardZoomControls />
    </Panel>
  );
}
