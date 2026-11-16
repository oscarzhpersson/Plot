import { useState, useRef } from "react";
import BoardToolbar from "./toolbar/BoardToolbar";
import {
  ReactFlow,
  Background,
  ConnectionMode,
  ConnectionLineType,
} from "@xyflow/react";
import { boardFitOptions } from "./boardViewport";
import { useBoardGraph } from "@/hooks/useBoardGraph";
import BoardCommentOverlay from "../comments/BoardCommentOverlay";
import BoardNoteNode from "@/components/card/BoardNoteNode";
import BoardImageNode from "@/components/card/BoardImageNode";
import BoardModelNode from "@/components/card/BoardModelNode";

import BoardMap from "./BoardMap";

import type { BoardTool } from "./boardTypes";
import type { BoardNode } from "@/data/boardSchema";
import type { CommentThread } from "@/data/commentStorage";
import type { ReactFlowInstance, XYPosition } from "@xyflow/react";

const nodeTypes = {
  note: BoardNoteNode,
  image: BoardImageNode,
  model: BoardModelNode,
};

type BoardProps = {
  threads: CommentThread[];
  activeThreadId: string | null;
  onCreateThread: (position: XYPosition, body: string) => boolean;
  onSelectThread: (id: string) => void;
};

export default function Board({
  threads,
  activeThreadId,
  onCreateThread,
  onSelectThread,
}: BoardProps) {
  const [tool, setTool] = useState<BoardTool>("pan");
  const [draftPosition, setDraftPosition] = useState<XYPosition | null>(null);

  const flow = useRef<Pick<
    ReactFlowInstance<BoardNode>,
    "screenToFlowPosition"
  > | null>(null);

  function startComment(event: { clientX: number; clientY: number }) {
    if (tool !== "comment" || !flow.current || draftPosition) return;

    setDraftPosition(
      flow.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      }),
    );
  }

  function postComment(body: string) {
    if (draftPosition && onCreateThread(draftPosition, body)) {
      setDraftPosition(null);
    }
  }

  const graph = useBoardGraph();
  const isPanMode = tool === "pan";

  return (
    <div className="h-full w-full">
      <ReactFlow
        {...graph}
        className="plot-board"
        elementsSelectable={isPanMode}
        fitView
        fitViewOptions={boardFitOptions}
        panOnDrag={isPanMode}
        panOnScroll
        panOnScrollSpeed={1}
        zoomOnScroll={false}
        zoomOnDoubleClick={isPanMode}
        zoomOnPinch
        maxZoom={3} // TODO: Break out to global settings value?
        proOptions={{ hideAttribution: true }}
        nodeTypes={nodeTypes}
        connectionRadius={100}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{ type: "smoothstep" }}
        onInit={(instance) => {
          flow.current = instance;
        }}
        onPaneClick={startComment}
        onNodeClick={startComment}
        onEdgeClick={startComment}
      >
        <Background gap={20} size={1} />
        <BoardMap />
        <BoardToolbar tool={tool} setTool={setTool} />
        <BoardCommentOverlay
          threads={threads}
          activeThreadId={activeThreadId}
          draftPosition={draftPosition}
          onSelectThread={onSelectThread}
          onPost={postComment}
          onDismiss={() => setDraftPosition(null)}
        />
      </ReactFlow>
    </div>
  );
}
