import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from "react";
import { getCommentsPanelLayout, minimumSidebarWidth } from "./commentLayout";

type CommentsPanelProps = {
  ref?: Ref<HTMLDivElement>;
  open: boolean;
  toolbarHost: HTMLDivElement | null;
  children: ReactNode;
};

const toolbarGap = 8;
const keyboardStep = 16;

export default function CommentsPanel({ ref, open, toolbarHost, children }: CommentsPanelProps) {
  const [workspace, setWorkspace] = useState<{ width: number; sidebarRoom: number; footer: number } | null>(null);
  const [preferredWidth, setPreferredWidth] = useState<number | null>(null);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef<{
    pointerId: number;
    x: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    // The host contains only the portal-mounted toolbar.
    const toolbar = toolbarHost?.firstElementChild;
    if (!toolbarHost || !toolbar) return;

    const observer = new ResizeObserver(() => {
      const hostBounds = toolbarHost.getBoundingClientRect();
      const toolbarBounds = toolbar.getBoundingClientRect();
      setWorkspace({
        width: Math.floor(hostBounds.width),
        sidebarRoom: Math.floor(hostBounds.right - toolbarBounds.right - toolbarGap),
        footer: Math.ceil(hostBounds.bottom - toolbarBounds.top + toolbarGap),
      });
    });

    observer.observe(toolbarHost);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, [toolbarHost]);

  const { width, maxWidth, docked } = getCommentsPanelLayout(
    workspace?.width ?? window.innerWidth - 8,
    workspace?.sidebarRoom ?? 0,
    preferredWidth,
  );
  const widthStyle = {
    "--plot-comments-width": `${width}px`,
    "--plot-comments-footer": `${workspace?.footer ?? 72}px`,
    maxWidth: docked ? maxWidth : undefined,
  } as CSSProperties;

  function resizeTo(nextWidth: number) {
    setPreferredWidth(Math.max(minimumSidebarWidth, Math.min(maxWidth, nextWidth)));
  }

  function startResize(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { pointerId: event.pointerId, x: event.clientX, width };
    setResizing(true);
  }

  function moveResize(event: PointerEvent<HTMLDivElement>) {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;

    resizeTo(start.width + start.x - event.clientX);
  }

  function stopResize(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current?.pointerId !== event.pointerId) return;

    dragStart.current = null;
    setResizing(false);
  }

  function resizeWithKey(event: KeyboardEvent<HTMLDivElement>) {
    const keyboardWidths: Partial<Record<string, number>> = {
      ArrowLeft: width + keyboardStep,
      ArrowRight: width - keyboardStep,
      Home: minimumSidebarWidth,
      End: maxWidth,
    };
    const nextWidth = keyboardWidths[event.key];
    if (nextWidth === undefined) return;

    event.preventDefault();
    resizeTo(nextWidth);
  }

  const motion = open
    ? "motion-safe:duration-(--plot-motion-enter) motion-safe:ease-(--plot-motion-ease-enter)"
    : "motion-safe:duration-(--plot-motion-exit) motion-safe:ease-(--plot-motion-ease-exit)";

  return (
    <div
      ref={ref}
      inert={!open}
      data-comments-overlay-open={open && !docked ? "" : undefined}
      style={widthStyle}
      className={`z-20 shrink-0 overflow-hidden ${docked ? "relative" : "absolute top-0 right-0 bottom-(--plot-comments-footer)"}
                  ${open ? "w-(--plot-comments-width)" : "w-0"}
                  ${resizing ? "" : `motion-safe:transition-[width] ${motion}`}`}
    >
      <div
        className={`h-full w-(--plot-comments-width) motion-safe:transition-[translate] ${motion} ${open ? "translate-x-0" : "translate-x-6"}`}
      >
        {children}
      </div>
      {docked && (
        <div
          role="separator"
          tabIndex={0}
          aria-label="Resize comments sidebar"
          aria-controls="comments-sidebar"
          aria-orientation="vertical"
          aria-valuemin={minimumSidebarWidth}
          aria-valuemax={maxWidth}
          aria-valuenow={width}
          aria-valuetext={`${width} pixels`}
          onPointerDown={startResize}
          onPointerMove={moveResize}
          onLostPointerCapture={stopResize}
          onKeyDown={resizeWithKey}
          className={`absolute inset-y-0 left-0 z-10 w-2 touch-none cursor-col-resize select-none outline-none before:absolute before:inset-y-0
                      before:left-0 before:w-0.5 hover:before:bg-plot-accent focus-visible:before:bg-plot-focus-ring ${resizing ? "before:bg-plot-accent" : ""}`}
        />
      )}
    </div>
  );
}
