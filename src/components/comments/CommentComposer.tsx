import { ArrowUp, MessageCircle } from "lucide-react";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import type { XYPosition } from "@xyflow/react";
import { placeCommentComposer, type CanvasRect, type CommentViewport } from "./commentLayout";

type CommentComposerProps = {
  anchor: XYPosition;
  viewport: CommentViewport;
  canvasElement: HTMLDivElement | null;
  toolbarElement: HTMLDivElement | null;
  onPost: (body: string) => void;
  onDismiss: () => void;
};

export default function CommentComposer({
  anchor,
  viewport,
  canvasElement,
  toolbarElement,
  onPost,
  onDismiss,
}: CommentComposerProps) {
  const [text, setText] = useState("");
  const [formHeight, setFormHeight] = useState(44);
  const [controls, setControls] = useState<CanvasRect[]>([]);
  const composerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const discardArmed = useRef(false);
  const body = text.trim();
  const hasBody = body.length > 0;

  useLayoutEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const minimap = canvasElement?.querySelector(".react-flow__minimap");
    const elements = [toolbarElement, minimap];
    const measure = () => {
      setFormHeight(form.offsetHeight);
      if (!canvasElement) return;

      const canvas = canvasElement.getBoundingClientRect();
      setControls(elements.flatMap((element) => {
        if (!element || getComputedStyle(element).visibility === "hidden") return [];
        const bounds = element.getBoundingClientRect();
        return [{
          left: bounds.left - canvas.left,
          right: bounds.right - canvas.left,
          top: bounds.top - canvas.top,
          bottom: bounds.bottom - canvas.top,
        }];
      }));
    };

    const observer = new ResizeObserver(measure);
    for (const element of [form, canvasElement, ...elements]) {
      if (element) observer.observe(element);
    }

    const minimapObserver = new MutationObserver(measure);
    if (minimap?.parentElement) {
      minimapObserver.observe(minimap.parentElement, { attributes: true, attributeFilter: ["class"] });
    }

    return () => {
      observer.disconnect();
      minimapObserver.disconnect();
    };
  }, [canvasElement, toolbarElement]);

  const dismiss = useEffectEvent(onDismiss);
  const getHasBody = useEffectEvent(() => hasBody);

  useEffect(() => {
    textareaRef.current?.focus({ preventScroll: true });

    let dismissTimer: number | undefined;
    let shake: Animation | undefined;

    function handleOutsideClick(event: MouseEvent) {
      const form = formRef.current;
      const composer = composerRef.current;
      if (!form || !composer) return;

      if (event.composedPath().includes(composer)) {
        discardArmed.current = false;
        return;
      }

      if (!getHasBody() || discardArmed.current) {
        // Let the board handle this click while the draft is still open.
        window.clearTimeout(dismissTimer);
        dismissTimer = window.setTimeout(dismiss, 0);
        return;
      }

      discardArmed.current = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      shake?.cancel();
      shake = form.animate(
        [{ translate: "0" }, { translate: "-4px" }, { translate: "4px" }, { translate: "0" }],
        { duration: 180, easing: "ease-out" },
      );
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented || event.isComposing) return;

      event.preventDefault();
      dismiss();
    }

    document.addEventListener("click", handleOutsideClick, true);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleOutsideClick, true);
      document.removeEventListener("keydown", handleEscape);
      window.clearTimeout(dismissTimer);
      shake?.cancel();
    };
  }, []);

  return (
    <div ref={composerRef} className="relative size-8">
      <span
        aria-hidden="true"
        className="plot-comment-pin pointer-events-auto border-plot-surface bg-plot-accent text-plot-accent-foreground shadow"
      >
        <MessageCircle size={16} />
      </span>
      <form
        ref={formRef}
        style={placeCommentComposer(anchor, viewport, formHeight, controls)}
        className="plot-comment-composer nodrag nopan nowheel pointer-events-auto absolute grid overflow-y-auto grid-cols-[minmax(0,1fr)_auto] items-center rounded-2xl border border-plot-border bg-plot-surface text-plot-text shadow focus-within:border-plot-focus-ring"
        onSubmit={(event) => {
          event.preventDefault();
          if (hasBody) onPost(body);
        }}
      >
        <textarea
          ref={textareaRef}
          aria-label="Comment"
          placeholder="Add a comment"
          rows={hasBody ? 3 : 1}
          value={text}
          onChange={(event) => {
            discardArmed.current = false;
            setText(event.target.value);
          }}
          className={`plot-comment-input w-full resize-none rounded-2xl px-4 text-sm leading-5 outline-none placeholder:text-plot-text-muted ${hasBody ? "col-span-2 h-21 py-3" : "h-10 py-2.5"}`}
        />
        <div
          className={
            hasBody
              ? "plot-comment-footer col-span-2 flex justify-end gap-2 border-t border-plot-border px-2.5 py-2"
              : "pr-2"
          }
        >
          {hasBody && (
            <button
              type="button"
              onClick={onDismiss}
              className="plot-toolbar-button px-2.5 text-xs font-semibold text-plot-text-muted"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            aria-label="Post comment"
            disabled={!hasBody}
            className="plot-comment-submit grid size-8 cursor-pointer place-items-center rounded-full bg-plot-accent text-plot-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plot-focus-ring disabled:cursor-default disabled:bg-plot-surface-muted disabled:text-plot-text-muted"
          >
            <ArrowUp aria-hidden="true" size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}
