import { useState } from "react";
import BoardToolbar from "./BoardToolbar";
import {
  ReactFlow,
  Background,
  ConnectionMode,
  ConnectionLineType,
} from "@xyflow/react";
import BoardMap from "./BoardMap";
import { boardFitOptions } from "./boardViewport";
import { useBoardGraph } from "@/hooks/useBoardGraph";
import BoardNoteNode from "@/components/card/BoardNoteNode";
import BoardImageNode from "@/components/card/BoardImageNode";
import BoardModelNode from "@/components/card/BoardModelNode";
import type { BoardTool } from "@/types/Board.type";

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
  const graph = useBoardGraph();

  // TODO: Add line removal.

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
      >
        <Background gap={20} size={1} />
        <BoardMap />
        <BoardToolbar tool={tool} setTool={setTool} />
      </ReactFlow>
    </div>
  );
}
