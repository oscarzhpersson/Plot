import { useImperativeHandle, useRef, useState, type Ref } from "react";
import { createPortal } from "react-dom";
import BoardToolbar from "./toolbar/BoardToolbar";
import { boardMotion, viewportAnimation } from "./toolbar/motion";
import {
  ReactFlow,
  Background,
  ConnectionMode,
  ConnectionLineType,
} from "@xyflow/react";
import { boardFitOptions, boardZoomLimits } from "./boardViewport";
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

const commentClickDistance = 4;
const pinRevealInset = 8;

function revealOffset(start: number, end: number, min: number, max: number) {
  if (start < min) return min + pinRevealInset - start;
  if (end > max) return max - pinRevealInset - end;
  return 0;
}

export type BoardHandle = {
  focusComment: (position: XYPosition) => void;
  revealComment: (id: string, sidebar?: DOMRect) => void;
};

type BoardProps = {
  ref?: Ref<BoardHandle>;
  threads: CommentThread[];
  activeThreadId: string | null;
  onCreateThread: (position: XYPosition, body: string) => boolean;
  onSelectThread: (id: string) => void;
  onMoveThread: (id: string, position: XYPosition) => void;
  onSetThreadResolved: (id: string, resolved: boolean) => void;
  toolbarHost?: HTMLDivElement | null;
};

export default function Board({
  ref,
  threads,
  activeThreadId,
  onCreateThread,
  onSelectThread,
  onMoveThread,
  onSetThreadResolved,
  toolbarHost,
}: BoardProps) {
  const [tool, setTool] = useState<BoardTool>("pan");
  const [toolbarElement, setToolbarElement] = useState<HTMLDivElement | null>(null);
  const [draftPosition, setDraftPosition] = useState<XYPosition | null>(null);
  const commentPress = useRef<XYPosition | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const flow = useRef<Pick<
    ReactFlowInstance<BoardNode>,
    "screenToFlowPosition" | "setCenter" | "getZoom" | "getViewport" | "setViewport"
  > | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      focusComment({ x, y }) {
        const viewport = flow.current;
        if (!viewport) return;

        void viewport.setCenter(x, y, {
          zoom: Math.max(viewport.getZoom(), 1.25),
          ...viewportAnimation(boardMotion.fit),
        });
      },
      revealComment(id, sidebar) {
        const viewport = flow.current;
        const canvas = canvasRef.current;
        const pin = canvas?.querySelector(`[data-comment-id="${CSS.escape(id)}"]`);
        if (!viewport || !canvas || !pin) return;

        const bounds = canvas.getBoundingClientRect();
        const pinBounds = pin.getBoundingClientRect();
        let { right, top } = bounds;
        if (
          sidebar && sidebar.left < right && sidebar.bottom > pinBounds.top &&
          sidebar.top < pinBounds.bottom && sidebar.left < pinBounds.right
        ) {
          // An overlay can cover nearly the full canvas on narrow screens.
          if (sidebar.left - bounds.left >= pinBounds.width + 2 * pinRevealInset) {
            right = sidebar.left;
          } else if (bounds.bottom - sidebar.bottom >= pinBounds.height + 2 * pinRevealInset) {
            top = sidebar.bottom;
          }
        }

        const dx = revealOffset(pinBounds.left, pinBounds.right, bounds.left, right);
        const dy = revealOffset(pinBounds.top, pinBounds.bottom, top, bounds.bottom);
        if (dx === 0 && dy === 0) return;

        const { x, y, zoom } = viewport.getViewport();
        void viewport.setViewport(
          { x: x + dx, y: y + dy, zoom },
          { ...viewportAnimation(boardMotion.fit), interpolate: "linear" },
        );
      },
    }),
    [],
  );

  function startComment(event: { clientX: number; clientY: number }) {
    const press = commentPress.current;
    commentPress.current = null;
    if (tool !== "comment" || !flow.current || draftPosition) return;

    if (
      press &&
      Math.hypot(event.clientX - press.x, event.clientY - press.y) > commentClickDistance
    ) {
      return;
    }

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
  const visibleThreads = threads.filter(
    ({ id, status }) => status === "open" || id === activeThreadId,
  );
  const toolbar = (
    <BoardToolbar ref={setToolbarElement} tool={tool} setTool={setTool} />
  );

  return (
    <div ref={canvasRef} className="h-full w-full">
      <ReactFlow
        {...graph}
        className="plot-board"
        data-tool={tool}
        elementsSelectable={isPanMode}
        nodesDraggable={isPanMode}
        nodesConnectable={isPanMode}
        nodesFocusable={isPanMode}
        edgesFocusable={isPanMode}
        edgesReconnectable={isPanMode}
        connectOnClick={isPanMode}
        deleteKeyCode={isPanMode ? "Backspace" : null}
        selectionKeyCode={isPanMode ? "Shift" : null}
        fitView
        fitViewOptions={boardFitOptions}
        panOnDrag={isPanMode ? true : [1]}
        panOnScroll
        panOnScrollSpeed={1}
        zoomOnScroll={false}
        zoomOnDoubleClick={isPanMode}
        zoomOnPinch
        {...boardZoomLimits}
        proOptions={{ hideAttribution: true }}
        nodeTypes={nodeTypes}
        connectionRadius={100}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={{ type: "smoothstep" }}
        onInit={(instance) => {
          flow.current = instance;
        }}
        onPointerDownCapture={(event) => {
          if (!isPanMode && event.isPrimary && event.button === 0) {
            commentPress.current = { x: event.clientX, y: event.clientY };
          }
        }}
        onPaneClick={startComment}
        onNodeClick={startComment}
        onEdgeClick={startComment}
      >
        <Background gap={20} size={1} />
        <BoardMap toolbarElement={toolbarElement} threads={visibleThreads} />
        {toolbarHost ? createPortal(toolbar, toolbarHost) : toolbar}
        <BoardCommentOverlay
          threads={visibleThreads}
          activeThreadId={activeThreadId}
          draftPosition={draftPosition}
          toolbarElement={toolbarElement}
          onSelectThread={onSelectThread}
          onMoveThread={onMoveThread}
          onSetThreadResolved={onSetThreadResolved}
          onPost={postComment}
          onDismiss={() => setDraftPosition(null)}
        />
      </ReactFlow>
    </div>
  );
}
