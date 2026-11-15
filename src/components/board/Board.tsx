import { useState, useEffect, useCallback } from "react";
import BoardToolbar from "./BoardToolbar";
import {
  ReactFlow,
  addEdge,
  Background,
  useEdgesState,
  useNodesState,
  type OnConnect,
} from "@xyflow/react";
import BoardMap from "./BoardMap";
import { loadBoard, saveBoard } from "@/data/boardStorage";
import BoardNoteNode from "@/components/card/BoardNoteNode";
import BoardImageNode from "@/components/card/BoardImageNode";
import type { BoardNode } from "@/data/boardSchema";

const nodeTypes = {
  note: BoardNoteNode,
  image: BoardImageNode,
};

export default function Board() {
  const [initialBoard] = useState(loadBoard);

  const [nodes, , onNodesChange] = useNodesState<BoardNode>(initialBoard.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialBoard.edges);

  useEffect(() => {
    if (nodes.some((node) => node.dragging)) return;

    saveBoard({ nodes, edges });
  }, [nodes, edges]);

  const onConnect = useCallback<OnConnect>(
    (connection) =>
      setEdges((currentEdges) => addEdge(connection, currentEdges)),
    [setEdges],
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        panOnScroll
        panOnScrollSpeed={1}
        zoomOnScroll={false}
        zoomOnPinch
        maxZoom={3} // TODO: Break out to global settings value?
        proOptions={{ hideAttribution: true }}
        nodeTypes={nodeTypes}
      >
        <Background gap={20} size={1} />
        <BoardMap />
        <BoardToolbar />
      </ReactFlow>
    </div>
  );
}
