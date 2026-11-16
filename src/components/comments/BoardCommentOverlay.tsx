import { useId } from "react";
import { useStore, ViewportPortal, type XYPosition } from "@xyflow/react";
import type { CommentThread } from "@/data/commentStorage";
import CommentComposer from "./CommentComposer";

type BoardCommentOverlayProps = {
  threads: CommentThread[];
  draftPosition: XYPosition | null;
  onPost: (body: string) => void;
  onDismiss: () => void;
};

export default function BoardCommentOverlay({
  threads,
  draftPosition,
  onPost,
  onDismiss,
}: BoardCommentOverlayProps) {
  const previewId = useId();
  const [panX, panY, zoom] = useStore((state) => state.transform);
  const width = useStore((state) => state.width);
  const height = useStore((state) => state.height);
  const screenScale = zoom ** 0.12;
  const scale = screenScale / zoom;

  return (
    <ViewportPortal>
      {threads.map(({ id, position, messages: [{ author, body }] }) => {
        const anchorX = panX + position.x * zoom;
        const anchorY = panY + position.y * zoom;
        const spaceLeft = anchorX / screenScale;
        const spaceRight = (width - anchorX) / screenScale - 32;
        const openLeft = spaceRight < 240 && spaceLeft > spaceRight;
        const previewWidth = Math.min(224, Math.max(80, (openLeft ? spaceLeft : spaceRight) - 16));
        const openUp = height - anchorY < 144 * screenScale && anchorY > height / 2;
        const tooltipId = `${previewId}-${id}`;

        return (
          <div
            key={id}
            className="group pointer-events-auto absolute -translate-y-full origin-bottom-left hover:z-10 focus-within:z-10"
            style={{ left: position.x, top: position.y, scale }}
          >
            <span
              role="img"
              tabIndex={0}
              aria-label={`Comment by ${author.name}`}
              aria-describedby={tooltipId}
              className="plot-comment-pin cursor-default border-plot-accent bg-plot-surface text-xs font-semibold text-plot-accent-soft-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plot-focus-ring motion-safe:transition-[scale] motion-safe:duration-(--plot-motion-feedback) motion-safe:ease-(--plot-motion-ease-feedback) motion-safe:group-hover:scale-110"
            >
              {author.initials}
            </span>
            <div
              className={`invisible absolute opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 motion-safe:scale-[.97] motion-safe:transition-[visibility,opacity,scale] motion-safe:duration-(--plot-motion-enter) motion-safe:ease-(--plot-motion-ease-enter) motion-safe:group-hover:scale-100 motion-safe:group-focus-within:scale-100 ${openLeft ? "right-full origin-right pr-2" : "left-full origin-left pl-2"} ${openUp ? "bottom-0" : "top-0"}`}
            >
              <div
                id={tooltipId}
                role="tooltip"
                className="nopan nowheel rounded-xl border border-plot-border bg-plot-surface p-3 text-sm text-plot-text shadow"
                style={{ width: previewWidth }}
              >
                <div className="mb-1 wrap-anywhere font-semibold">{author.name}</div>
                <p className="max-h-32 overflow-y-auto overscroll-contain wrap-anywhere whitespace-pre-wrap">
                  {body}
                </p>
              </div>
            </div>
          </div>
        );
      })}

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
