import { Handle, Position } from "@xyflow/react";

export default function generateCardHandles(
  visibility: string,
  isConnected: (side: Position) => boolean,
) {
  return [Position.Top, Position.Right, Position.Bottom, Position.Left].map(
    (side) => (
      <Handle
        key={side}
        id={side}
        type="source"
        position={side}
        style={{ [side]: -10 }}
        className={`size-3 rounded-full border-2 border-plot-accent hover:bg-plot-accent cursor-default [&.connectingto.valid]:bg-plot-accent ${
          isConnected(side)
            ? "bg-plot-accent opacity-100"
            : `bg-plot-surface ${visibility}`
        }`}
      />
    ),
  );
}
