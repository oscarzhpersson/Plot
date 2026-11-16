import type { ReactNode } from "react";
import {
  useConnection,
  useNodeId,
  useNodeConnections,
  NodeResizer,
} from "@xyflow/react";
import generateCardHandles from "./generateCardHandles";

type BoardCardProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  draggable: boolean;
  isConnectable: boolean;
  badge?: string;
  children: ReactNode;
};

export default function BoardCard({
  title,
  subtitle,
  selected = false,
  draggable,
  isConnectable,
  badge,
  children,
}: BoardCardProps) {
  const connecting = useConnection((connection) => connection.inProgress);

  const nodeId = useNodeId();
  const nearby = useConnection(
    (connection) =>
      connection.inProgress && connection.toHandle?.nodeId === nodeId,
  );

  const connections = useNodeConnections();
  const isEditing = selected && draggable;

  const isConnected = (side: string) =>
    connections.some(
      (edge) =>
        (edge.source === nodeId && edge.sourceHandle === side) ||
        (edge.target === nodeId && edge.targetHandle === side),
    );

  const handleVisibility =
    isEditing || nearby
      ? "opacity-100"
      : connecting
        ? "opacity-0 group-hover:opacity-100"
        : "pointer-events-none opacity-0";

  return (
    <div className="group relative h-full w-full">
      {generateCardHandles(handleVisibility, isConnected, isConnectable)}
      <NodeResizer
        isVisible={isEditing && !connecting}
        minWidth={220}
        minHeight={150}
        handleClassName="plot-resize-corner"
        lineClassName="plot-resize-edge"
      />
      <article
        className={`flex h-full w-full flex-col rounded-2xl border bg-plot-surface p-4 text-plot-text shadow
                    ${isEditing ? "border-plot-accent" : "border-plot-border"}
                    ${draggable ? "cursor-default active:cursor-grabbing" : "cursor-crosshair"}`}
      >
        <header className="flex shrink-0 items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-xs text-plot-text-muted">{subtitle}</p>
            )}
          </div>
          {badge && (
            <span className="shrink-0 whitespace-nowrap rounded-lg bg-plot-accent-soft px-2 py-1 text-xs font-semibold text-plot-accent-soft-foreground">
              {badge}
            </span>
          )}
        </header>
        <div className="mt-3 min-h-0 flex-1">{children}</div>
      </article>
    </div>
  );
}
