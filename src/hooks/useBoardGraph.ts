import { useCallback, useEffect, useState } from "react";
import { addEdge, useEdgesState, useNodesState, type OnConnect } from "@xyflow/react";

import type { BoardNode } from "@/data/boardSchema";
import { loadBoard, saveBoard } from "@/data/boardStorage";

export function useBoardGraph() {
  const [initialBoard] = useState(loadBoard);
  const [nodes, , onNodesChange] = useNodesState<BoardNode>(initialBoard.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialBoard.edges);

  useEffect(() => {
    if (nodes.some((node) => node.dragging || node.resizing)) return;

    saveBoard({ nodes, edges });
  }, [nodes, edges]);

  const onConnect = useCallback<OnConnect>(
    (connection) => setEdges((currentEdges) => addEdge(connection, currentEdges)),
    [setEdges],
  );

  return { nodes, edges, onNodesChange, onEdgesChange, onConnect };
}
