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
        className="block h-full w-full rounded-xl object-contain"
      />
    </BoardCard>
  );
}
