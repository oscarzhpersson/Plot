import type { Node, NodeProps } from "@xyflow/react";
import BoardCard from "./BoardCard";

export type NoteNode = Node<
  { label: string; subtitle: string; text: string },
  "note"
>;

export default function BoardNoteNode({ data }: NodeProps<NoteNode>) {
  return (
    <BoardCard title={data.label} subtitle={data.subtitle}>
      <p className="w-80 text-sm">{data.text}</p>
    </BoardCard>
  );
}
