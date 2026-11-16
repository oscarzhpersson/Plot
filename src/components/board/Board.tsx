import { useState, useRef } from "react";
import BoardToolbar from "./BoardToolbar";
import {
  ReactFlow,
  Background,
  ConnectionMode,
  ConnectionLineType,
  ViewportPortal,
} from "@xyflow/react";
import { boardFitOptions } from "./boardViewport";
import { useBoardGraph } from "@/hooks/useBoardGraph";
import BoardNoteNode from "@/components/card/BoardNoteNode";
import BoardImageNode from "@/components/card/BoardImageNode";
import BoardModelNode from "@/components/card/BoardModelNode";

import BoardMap from "./BoardMap";

import type { BoardTool } from "@/types/Board.type";
import type { BoardNode } from "@/data/boardSchema";
import type { ReactFlowInstance, XYPosition } from "@xyflow/react";

const nodeTypes = {
  note: BoardNoteNode,
  image: BoardImageNode,
  model: BoardModelNode,
};

const edgeStyle = {
  stroke: "var(--plot-accent)",
  strokeWidth: 2,
};

export default function Board() {
  const [tool, setTool] = useState<BoardTool>("pan");

  const flow = useRef<Pick<
    ReactFlowInstance<BoardNode>,
    "screenToFlowPosition"
  > | null>(null);
  const [draftPosition, setDraftPosition] = useState<XYPosition | null>(null);

  function startComment(event: { clientX: number; clientY: number }) {
    if (tool !== "comment" || !flow.current) return;

    setDraftPosition(
      flow.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      }),
    );
  }

  const graph = useBoardGraph();

  return (
    <div className="h-full w-full">
      <ReactFlow
        {...graph}
        fitView
        fitViewOptions={boardFitOptions}
        panOnDrag={tool === "pan"}
        panOnScroll
        panOnScrollSpeed={1}
        zoomOnScroll={false}
        zoomOnPinch
        maxZoom={3} // TODO: Break out to global settings value?
        proOptions={{ hideAttribution: true }}
        nodeTypes={nodeTypes}
        connectionRadius={100}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={edgeStyle}
        defaultEdgeOptions={{ type: "smoothstep", style: edgeStyle }}
        onInit={(instance) => {
          flow.current = instance;
        }}
        onPaneClick={startComment}
        onNodeClick={startComment}
      >
        <Background gap={20} size={1} />
        <BoardMap />
        <BoardToolbar tool={tool} setTool={setTool} />
        <ViewportPortal>
          {draftPosition && (
            <span
              className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-plot-accent"
              style={{ left: draftPosition.x, top: draftPosition.y }}
            />
          )}
        </ViewportPortal>
      </ReactFlow>
    </div>
  );
}
