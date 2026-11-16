import { useStore, ViewportPortal, type XYPosition } from "@xyflow/react";
import CommentComposer from "./CommentComposer";

export type BoardComment = {
  id: string;
  position: XYPosition;
  body: string;
  author: { name: string; initials: string };
};

type BoardCommentOverlayProps = {
  comments: BoardComment[];
  draftPosition: XYPosition | null;
  onPost: (body: string) => void;
  onDismiss: () => void;
};

export default function BoardCommentOverlay({
  comments,
  draftPosition,
  onPost,
  onDismiss,
}: BoardCommentOverlayProps) {
  const zoom = useStore((state) => state.transform[2]);
  const screenScale = zoom ** 0.12;
  const scale = screenScale / zoom;

  return (
    <ViewportPortal>
      {comments.map(({ id, position, author }) => (
        <span
          key={id}
          role="img"
          aria-label={`Comment by ${author.name}`}
          title={author.name}
          className="plot-comment-pin pointer-events-auto absolute -translate-y-full cursor-default border-plot-accent bg-plot-surface text-xs font-semibold text-plot-accent-soft-foreground motion-safe:transition-[scale] motion-safe:duration-(--plot-motion-feedback) motion-safe:ease-(--plot-motion-ease-feedback) motion-safe:hover:scale-110"
          style={{
            left: position.x,
            top: position.y,
            transform: `scale(${scale})`,
          }}
        >
          {author.initials}
        </span>
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
