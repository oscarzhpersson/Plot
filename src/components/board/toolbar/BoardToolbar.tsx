import type { Ref } from "react";
import { Panel } from "@xyflow/react";
import BoardActionControls from "./BoardActionControls";
import BoardZoomControls from "./BoardZoomControls";

import type { BoardTool } from "../boardTypes";

export type BoardToolbarProps = {
  ref?: Ref<HTMLDivElement>;
  tool: BoardTool;
  setTool: (tool: BoardTool) => void;
};

export default function BoardToolbar({ ref, tool, setTool }: BoardToolbarProps) {
  return (
    <Panel
      ref={ref}
      position="bottom-center"
      className="pointer-events-auto flex items-center gap-0.75 rounded-xl border border-plot-border bg-plot-surface
                  text-plot-text p-1.25 shadow select-none"
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
