import { useReactFlow, useStore, ViewportPortal, type XYPosition } from "@xyflow/react";
import type { CommentThread } from "@/data/commentStorage";
import CommentComposer from "./CommentComposer";
import CommentPin from "./CommentPin";

type BoardCommentOverlayProps = {
  threads: CommentThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onMoveThread: (id: string, position: XYPosition) => void;
  onSetThreadResolved: (id: string, resolved: boolean) => void;
  draftPosition: XYPosition | null;
  onPost: (body: string) => void;
  onDismiss: () => void;
};

export default function BoardCommentOverlay({
  threads,
  activeThreadId,
  onSelectThread,
  onMoveThread,
  onSetThreadResolved,
  draftPosition,
  onPost,
  onDismiss,
}: BoardCommentOverlayProps) {
  const { screenToFlowPosition } = useReactFlow();
  const transform = useStore((state) => state.transform);
  const zoom = transform[2];
  const width = useStore((state) => state.width);
  const height = useStore((state) => state.height);
  const screenScale = zoom ** 0.12;
  const scale = screenScale / zoom;

  return (
    <ViewportPortal>
      {threads.map((thread) => (
        <CommentPin
          key={thread.id}
          thread={thread}
          selected={thread.id === activeThreadId}
          viewport={{ transform, width, height, scale }}
          screenToFlowPosition={screenToFlowPosition}
          onSelect={onSelectThread}
          onMove={onMoveThread}
          onSetResolved={onSetThreadResolved}
        />
      ))}

      {draftPosition && (
        <div
          className="absolute z-10 origin-top-left"
          style={{ left: draftPosition.x, top: draftPosition.y, scale }}
        >
          <div className="-translate-y-8">
            <CommentComposer onPost={onPost} onDismiss={onDismiss} />
          </div>
        </div>
      )}
    </ViewportPortal>
  );
}
