import { useId, useRef, useState, type PointerEvent } from "react";
import { Check } from "lucide-react";
import type { ReactFlowInstance, Transform, XYPosition } from "@xyflow/react";
import type { CommentThread } from "@/data/commentStorage";

type CommentPinProps = {
  thread: CommentThread;
  selected: boolean;
  viewport: {
    transform: Transform;
    width: number;
    height: number;
    scale: number;
  };
  screenToFlowPosition: ReactFlowInstance["screenToFlowPosition"];
  onSelect: (id: string) => void;
  onMove: (id: string, position: XYPosition) => void;
  onSetResolved: (id: string, resolved: boolean) => void;
};

type PinGesture = {
  pointerId: number;
  start: XYPosition;
  offset: XYPosition;
  moved: boolean;
};

const dragThreshold = 4;

export default function CommentPin({
  thread,
  selected,
  viewport,
  screenToFlowPosition,
  onSelect,
  onMove,
  onSetResolved,
}: CommentPinProps) {
  const {
    id,
    position,
    messages: [{ author, body }],
  } = thread;
  const tooltipId = useId();
  const resolved = thread.status === "resolved";
  const gesture = useRef<PinGesture | null>(null);
  const suppressClick = useRef(false);
  const [dragPosition, setDragPosition] = useState<XYPosition | null>(null);

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return;

    const start = { x: event.clientX, y: event.clientY };
    const cursor = screenToFlowPosition(start, { snapToGrid: false });
    gesture.current = {
      pointerId: event.pointerId,
      start,
      offset: { x: position.x - cursor.x, y: position.y - cursor.y },
      moved: false,
    };
    suppressClick.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function getDragPosition(event: PointerEvent<HTMLButtonElement>) {
    const drag = gesture.current;
    if (!drag || drag.pointerId !== event.pointerId) return null;

    const point = { x: event.clientX, y: event.clientY };
    if (
      !drag.moved &&
      Math.hypot(point.x - drag.start.x, point.y - drag.start.y) < dragThreshold
    ) {
      return null;
    }

    const cursor = screenToFlowPosition(point, { snapToGrid: false });
    return { x: cursor.x + drag.offset.x, y: cursor.y + drag.offset.y };
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const drag = gesture.current;
    if (!drag) return;

    const next = getDragPosition(event);
    if (!next) return;

    drag.moved = true;
    setDragPosition(next);
  }

  function finishDrag(event: PointerEvent<HTMLButtonElement>) {
    if (gesture.current?.pointerId !== event.pointerId) return;

    const next = getDragPosition(event);
    gesture.current = null;
    setDragPosition(null);
    if (!next) return;

    suppressClick.current = true;
    if (next.x !== position.x || next.y !== position.y) onMove(id, next);
  }

  function cancelDrag(event: PointerEvent<HTMLButtonElement>) {
    if (gesture.current?.pointerId !== event.pointerId) return;

    suppressClick.current = gesture.current.moved;
    gesture.current = null;
    setDragPosition(null);
  }

  const { x, y } = dragPosition ?? position;
  const {
    transform: [panX, panY, zoom],
    width,
    height,
    scale,
  } = viewport;
  const screenScale = zoom * scale;
  const anchorX = panX + x * zoom;
  const anchorY = panY + y * zoom;
  const spaceLeft = anchorX / screenScale;
  const spaceRight = (width - anchorX) / screenScale - 32;
  const openLeft = spaceRight < 240 && spaceLeft > spaceRight;
  const previewWidth = Math.min(
    224,
    Math.max(80, (openLeft ? spaceLeft : spaceRight) - 16),
  );
  const openUp = height - anchorY < 180 * screenScale && anchorY > height / 2;

  return (
    <div
      className={`group pointer-events-auto absolute -translate-y-full origin-bottom-left ${dragPosition ? "z-20" : "hover:z-10 focus-within:z-10"}`}
      style={{ left: x, top: y, scale }}
    >
      <button
        type="button"
        aria-label={`Open ${resolved ? "resolved " : ""}comment by ${author.name}`}
        aria-describedby={tooltipId}
        aria-pressed={selected}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={cancelDrag}
        onLostPointerCapture={cancelDrag}
        onClick={(event) => {
          if (event.detail > 0 && suppressClick.current) {
            suppressClick.current = false;
            event.stopPropagation();
            return;
          }
          onSelect(id);
        }}
        className={`plot-comment-pin peer nodrag nopan touch-none cursor-grab select-none text-xs font-semibold
                    active:cursor-grabbing aria-pressed:shadow focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-plot-focus-ring motion-safe:transition-[scale] motion-safe:duration-(--plot-motion-feedback)
                    motion-safe:ease-(--plot-motion-ease-feedback) motion-safe:group-hover:scale-110
                    ${
                      resolved
                        ? "border-plot-resolved bg-plot-resolved-soft text-plot-resolved aria-pressed:bg-plot-resolved aria-pressed:text-plot-resolved-soft"
                        : "border-plot-accent bg-plot-surface text-plot-accent-soft-foreground aria-pressed:border-plot-surface aria-pressed:bg-plot-accent aria-pressed:text-plot-accent-foreground"
                    }`}
      >
        {resolved ? <Check size={16} aria-hidden="true" /> : author.initials}
      </button>
      <div
        className={`invisible absolute opacity-0 peer-focus-visible:visible peer-focus-visible:opacity-100 focus-within:visible focus-within:opacity-100
                    motion-safe:scale-[.97] motion-safe:transition-[visibility,opacity,scale]
                    motion-safe:duration-(--plot-motion-enter) motion-safe:ease-(--plot-motion-ease-enter)
                    motion-safe:group-hover:scale-100 motion-safe:peer-focus-visible:scale-100 motion-safe:focus-within:scale-100
                    ${dragPosition ? "hidden" : "group-hover:visible group-hover:opacity-100"}
                    ${openLeft ? "right-full origin-right pr-2" : "left-full origin-left pl-2"} ${openUp ? "bottom-0" : "top-0"}`}
      >
        <div
          className="nopan nowheel rounded-xl border border-plot-border bg-plot-surface p-3 text-sm text-plot-text shadow"
          style={{ width: previewWidth }}
        >
          <div id={tooltipId} role="tooltip">
            <div className="mb-1 wrap-anywhere font-semibold">
              {author.name}
            </div>
            <p className="max-h-32 overflow-y-auto overscroll-contain wrap-anywhere whitespace-pre-wrap">
              {body}
            </p>
          </div>
          <label
            className="mt-2 flex cursor-pointer items-center gap-2 border-t border-plot-border
                            pt-2 text-xs font-medium text-plot-text-muted"
          >
            <input
              type="checkbox"
              checked={resolved}
              onChange={(event) =>
                onSetResolved(id, event.currentTarget.checked)
              }
              className="size-4 cursor-pointer accent-plot-resolved focus-visible:outline-2
                          focus-visible:outline-offset-2 focus-visible:outline-plot-focus-ring"
            />
            Resolved
          </label>
        </div>
      </div>
    </div>
  );
}
