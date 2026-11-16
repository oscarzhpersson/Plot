import type { NodeProps } from "@xyflow/react";
import type { ImageNode } from "@/data/boardSchema";
import BoardCard from "./BoardCard";

export default function BoardImageNode({
  data,
  selected,
  draggable,
  isConnectable,
}: NodeProps<ImageNode>) {
  return (
    <BoardCard
      title={data.label}
      subtitle={data.subtitle}
      selected={selected}
      draggable={draggable}
      isConnectable={isConnectable}
      badge="Drawing"
    >
      <img
        src={data.src}
        alt={data.alt}
        draggable={false}
        className="block h-full w-full rounded-xl object-contain"
      />
    </BoardCard>
  );
}
