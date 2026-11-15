import type { NodeProps } from "@xyflow/react";
import type { NoteNode } from "@/data/boardSchema";
import BoardCard from "./BoardCard";

export default function BoardNoteNode({ data, selected }: NodeProps<NoteNode>) {
  return (
    <BoardCard title={data.label} subtitle={data.subtitle} selected={selected}>
      <p className="w-80 max-w-full text-sm">{data.text}</p>
    </BoardCard>
  );
}
