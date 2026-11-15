import type { ReactNode } from "react";
import { useConnection, useNodeId, useNodeConnections } from "@xyflow/react";
import generateCardHandles from "@/utility/generateCardHandles";

type BoardCardProps = {
  title: string;
  subtitle: string;
  selected: boolean;
  children: ReactNode;
};

export default function BoardCard({
  title,
  subtitle,
  selected = false,
  children,
}: BoardCardProps) {
  const connecting = useConnection((connection) => connection.inProgress);

  const nodeId = useNodeId();
  const nearby = useConnection(
    (connection) =>
      connection.inProgress && connection.toHandle?.nodeId === nodeId,
  );

  const connections = useNodeConnections();

  const isConnected = (side: string) =>
    connections.some(
      (edge) =>
        (edge.source === nodeId && edge.sourceHandle === side) ||
        (edge.target === nodeId && edge.targetHandle === side),
    );

  const handleVisibility =
    selected || nearby
      ? "opacity-100"
      : connecting
        ? "opacity-0 group-hover:opacity-100"
        : "pointer-events-none opacity-0";

  return (
    <div className="group relative">
      {generateCardHandles(handleVisibility, isConnected)}
      <article
        className={`cursor-default rounded-2xl border ${selected ? "border-plot-accent" : "border-plot-border"} bg-plot-surface p-4 text-plot-text shadow active:cursor-grabbing`}
      >
        <header>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs text-plot-text-muted">{subtitle}</p>
          )}
        </header>
        <div className="mt-3">{children}</div>
      </article>
    </div>
  );
}
