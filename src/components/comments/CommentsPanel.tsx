import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

type CommentsPanelProps = {
  open: boolean;
  children: ReactNode;
};

const minimumWidth = 300;
const maximumWidth = 640;
const minimumCanvasWidth = 344;
const defaultWidth = 400;
const keyboardStep = 16;

export default function CommentsPanel({ open, children }: CommentsPanelProps) {
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [preferredWidth, setPreferredWidth] = useState<number | null>(null);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef<{
    pointerId: number;
    x: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  const maxWidth = Math.max(
    minimumWidth,
    Math.min(maximumWidth, viewportWidth - minimumCanvasWidth),
  );
  const width = Math.min(
    maxWidth,
    preferredWidth ?? Math.max(defaultWidth, Math.round(viewportWidth / 4)),
  );
  const widthStyle = {
    "--plot-comments-desktop-width": `${width}px`,
  } as CSSProperties;

  function resizeTo(nextWidth: number) {
    setPreferredWidth(Math.max(minimumWidth, Math.min(maxWidth, nextWidth)));
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
      Home: minimumWidth,
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
      inert={!open}
      style={widthStyle}
      className={`absolute inset-y-0 right-0 z-20 shrink-0 overflow-hidden [--plot-comments-width:min(25rem,calc(100vw-1rem))]
                  md:relative md:[--plot-comments-width:var(--plot-comments-desktop-width)] ${open ? "w-(--plot-comments-width)" : "w-0"}
                  ${resizing ? "" : `motion-safe:transition-[width] ${motion}`}`}
    >
      <div
        className={`h-full w-(--plot-comments-width) motion-safe:transition-[translate] ${motion} ${open ? "translate-x-0" : "translate-x-6"}`}
      >
        {children}
      </div>
      <div
        role="separator"
        tabIndex={0}
        aria-label="Resize comments sidebar"
        aria-controls="comments-sidebar"
        aria-orientation="vertical"
        aria-valuemin={minimumWidth}
        aria-valuemax={maxWidth}
        aria-valuenow={width}
        aria-valuetext={`${width} pixels`}
        onPointerDown={startResize}
        onPointerMove={moveResize}
        onLostPointerCapture={stopResize}
        onKeyDown={resizeWithKey}
        className={`absolute inset-y-0 left-0 z-10 hidden w-2 touch-none cursor-col-resize select-none outline-none before:absolute before:inset-y-0
                    before:left-0 before:w-0.5 hover:before:bg-plot-accent focus-visible:before:bg-plot-focus-ring md:block ${resizing ? "before:bg-plot-accent" : ""}`}
      />
    </div>
  );
}
