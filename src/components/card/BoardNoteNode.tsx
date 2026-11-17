import type { NodeProps } from "@xyflow/react";
import type { NoteNode } from "@/data/boardSchema";
import BoardCard from "./BoardCard";

export default function BoardNoteNode({
  data,
  selected,
  draggable,
  isConnectable,
}: NodeProps<NoteNode>) {
  return (
    <BoardCard
      title={data.label}
      subtitle={data.subtitle}
      selected={selected}
      draggable={draggable}
      isConnectable={isConnectable}
      fitContent
    >
      <p className="w-80 max-w-full wrap-anywhere text-sm">{data.text}</p>
    </BoardCard>
  );
}
