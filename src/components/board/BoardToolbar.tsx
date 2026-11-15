import { Panel, useReactFlow, useStoreApi } from "@xyflow/react";
import { Minus, Plus, Scan } from "lucide-react";
import { useCallback, useEffect, useRef, type PointerEvent } from "react";
import { getNextZoomPercent } from "@/utility/getNextZoomPercent";

import { boardMotion, viewportAnimation } from "@/lib/motion";
import type { BoardTool } from "@/types/Board.type";

import ZoomPresetMenu from "./ZoomPresetMenu";

const toolbarButtonStyles =
  "cursor-pointer rounded-lg hover:bg-plot-toolbar-hover active:bg-plot-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plot-focus-ring motion-safe:transition-colors motion-safe:duration-(--plot-motion-feedback) motion-safe:ease-(--plot-motion-ease-feedback)";

const iconClassName =
  "motion-safe:transition-transform motion-safe:duration-(--plot-motion-feedback) motion-safe:ease-(--plot-motion-ease-feedback) motion-safe:group-hover:scale-[1.125] motion-safe:group-active:scale-95";

const zoomHoldDelay = 320; // TODO: Add to separate file
const zoomHoldDoublingTime = 800; // TODO: Add to separate file

type ZoomDirection = "in" | "out";

export type BoardToolbarProps = {
  tool: BoardTool;
  onToolChange: (tool: BoardTool) => void;
};

export default function BoardToolbar() {
  const { getZoom, zoomTo, fitView } = useReactFlow();
  const store = useStoreApi();

  const zoomHoldFrame = useRef<number | null>(null);
  const didHoldZoom = useRef(false);

  const stopZoomHold = useCallback(() => {
    if (zoomHoldFrame.current !== null) {
      window.cancelAnimationFrame(zoomHoldFrame.current);
      zoomHoldFrame.current = null;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("blur", stopZoomHold);
    return () => {
      window.removeEventListener("blur", stopZoomHold);
      stopZoomHold();
    };
  }, [stopZoomHold]);

  function stepZoom(direction: ZoomDirection) {
    const currentZoom = getZoom();
    const nextZoom = getNextZoomPercent(currentZoom, direction) / 100;

    if (nextZoom === currentZoom) return;

    void zoomTo(nextZoom, viewportAnimation(boardMotion.zoom));
  }

  function startZoomHold(
    event: PointerEvent<HTMLButtonElement>,
    direction: ZoomDirection,
  ) {
    if (event.button !== 0 || !event.isPrimary) return;

    stopZoomHold();
    didHoldZoom.current = false;

    const { minZoom, maxZoom } = store.getState();
    const sign = direction === "in" ? 1 : -1;
    const limit = direction === "in" ? maxZoom : minZoom;
    let previousTime = performance.now() + zoomHoldDelay;

    function zoomFrame(time: number) {
      if (time >= previousTime) {
        didHoldZoom.current = true;
        const currentZoom = getZoom();
        if (currentZoom === limit) return;

        const elapsed = Math.min(time - previousTime, 50);
        void zoomTo(
          currentZoom * 2 ** ((sign * elapsed) / zoomHoldDoublingTime),
        );
        previousTime = time;
      }
      zoomHoldFrame.current = window.requestAnimationFrame(zoomFrame);
    }

    zoomHoldFrame.current = window.requestAnimationFrame(zoomFrame);
  }

  const zoomHoldEndHandlers = {
    onPointerUp: stopZoomHold,
    onPointerLeave: stopZoomHold,
    onPointerCancel: stopZoomHold,
    onLostPointerCapture: stopZoomHold,
  };

  return (
    <Panel
      position="bottom-center"
      className="flex items-center gap-0.75 rounded-xl border border-plot-border bg-plot-surface text-plot-text p-1.25 shadow select-none"
    >
      <button
        type="button"
        title="Zoom out"
        aria-label="Zoom out"
        className={`nopan group grid h-8.5 w-8 touch-none place-items-center ${toolbarButtonStyles}`}
        {...zoomHoldEndHandlers}
        onPointerDown={(event) => startZoomHold(event, "out")}
        onClick={(event) => {
          if (event.detail === 0 || !didHoldZoom.current) stepZoom("out");
        }}
      >
        <Minus
          size={16}
          strokeWidth={1.75}
          className={iconClassName}
          aria-hidden="true"
        />
      </button>
      <ZoomPresetMenu triggerClassName={toolbarButtonStyles} />
      <button
        type="button"
        title="Zoom in"
        aria-label="Zoom in"
        className={`nopan group grid h-8.5 w-8 touch-none place-items-center ${toolbarButtonStyles}`}
        {...zoomHoldEndHandlers}
        onPointerDown={(event) => startZoomHold(event, "in")}
        onClick={(event) => {
          if (event.detail === 0 || !didHoldZoom.current) stepZoom("in");
        }}
      >
        <Plus
          size={16}
          strokeWidth={1.75}
          className={iconClassName}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        title="Fit board"
        aria-label="Fit board"
        className={`group grid h-8.5 w-8 place-items-center ${toolbarButtonStyles}`}
        onClick={() => void fitView(viewportAnimation(boardMotion.fit))}
      >
        <Scan
          size={16}
          strokeWidth={1.75}
          className={iconClassName}
          aria-hidden="true"
        />
      </button>
    </Panel>
  );
}
