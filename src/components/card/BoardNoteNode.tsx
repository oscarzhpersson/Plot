import type { NodeProps } from "@xyflow/react";
import type { NoteNode } from "@/data/boardSchema";
import BoardCard from "./BoardCard";

export default function BoardNoteNode({ data }: NodeProps<NoteNode>) {
  return (
    <BoardCard title={data.label} subtitle={data.subtitle}>
      <p className="w-80 text-sm">{data.text}</p>
    </BoardCard>
  );
}
