import type { NodeProps } from "@xyflow/react";
import type { ImageNode } from "@/data/boardSchema";
import BoardCard from "./BoardCard";

export default function BoardImageNode({ data }: NodeProps<ImageNode>) {
  return (
    <BoardCard title={data.label} subtitle={data.subtitle}>
      <img
        src={data.src}
        alt={data.alt}
        draggable={false}
        className="block aspect-2/1 w-72 rounded-xl bg-plot-surface-muted object-contain p-3"
      />
    </BoardCard>
  );
}
