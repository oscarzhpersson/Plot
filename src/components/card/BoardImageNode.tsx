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
        className="block h-auto w-auto max-h-72 max-w-80 rounded-xl object-contain"
      />
    </BoardCard>
  );
}
