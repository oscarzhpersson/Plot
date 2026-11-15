import type { NodeProps } from "@xyflow/react";
import type { ImageNode } from "@/data/boardSchema";
import BoardCard from "./BoardCard";

export default function BoardImageNode({
  data,
  selected,
}: NodeProps<ImageNode>) {
  return (
    <BoardCard
      title={data.label}
      subtitle={data.subtitle}
      selected={selected}
      badge="Drawing"
    >
      <img
        src={data.src}
        alt={data.alt}
        draggable={false}
        className="block h-auto w-auto max-h-72 max-w-80 rounded-xl object-contain"
      />
    </BoardCard>
  );
}
