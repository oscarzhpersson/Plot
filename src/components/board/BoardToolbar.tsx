import { useState } from "react";
import { Panel } from "@xyflow/react";
import BoardActionControls from "./BoardActionControls";
import BoardZoomControls from "./BoardZoomControls";

import type { BoardTool } from "@/types/Board.type";

export default function BoardToolbar() {
  const [tool, setTool] = useState<BoardTool>("pan");

  return (
    <Panel
      position="bottom-center"
      className="flex items-center gap-0.75 rounded-xl border border-plot-border bg-plot-surface text-plot-text p-1.25 shadow select-none"
    >
      <BoardActionControls current={tool} onToolChange={setTool} />
      <span
        aria-hidden="true"
        className="mx-1 h-6 w-px shrink-0 bg-plot-border"
      />
      <BoardZoomControls />
    </Panel>
  );
}
