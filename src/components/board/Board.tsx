import { useCallback } from "react";
import BoardToolbar from "./BoardToolbar";
import {
  ReactFlow,
  addEdge,
  Background,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type OnConnect,
} from "@xyflow/react";
import BoardMap from "./BoardMap";

type BoardNode = Node<{ label: string }>;

const initialNodes: BoardNode[] = [
  { id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
];
const initialEdges: Edge[] = [{ id: "n1-n2", source: "n1", target: "n2" }];

export default function Board() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
      >
        <Background gap={20} size={1} />
        <BoardMap />
        <BoardToolbar />
      </ReactFlow>
    </div>
  );
}
