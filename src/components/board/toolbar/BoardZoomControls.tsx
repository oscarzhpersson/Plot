import { useReactFlow, useStoreApi } from "@xyflow/react";
import { Minus, Plus, Scan } from "lucide-react";
import { useCallback, useEffect, useRef, type PointerEvent } from "react";

import { boardMotion, viewportAnimation } from "./motion";
import { boardFitOptions } from "../boardViewport";
import { getNextZoomPercent } from "./getNextZoomPercent";

import ZoomPresetMenu from "./ZoomPresetMenu";

const zoomHoldDelay = 320;
const zoomHoldDoublingTime = 800;

type ZoomDirection = "in" | "out";

export default function BoardZoomControls() {
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
    <>
      <button
        type="button"
        title="Zoom out"
        aria-label="Zoom out"
        className="plot-toolbar-button nopan grid h-8.5 w-8 touch-none place-items-center"
        {...zoomHoldEndHandlers}
        onPointerDown={(event) => startZoomHold(event, "out")}
        onClick={(event) => {
          if (event.detail === 0 || !didHoldZoom.current) stepZoom("out");
        }}
      >
        <Minus
          size={16}
          strokeWidth={1.75}
          className="plot-toolbar-icon"
          aria-hidden="true"
        />
      </button>
      <ZoomPresetMenu />
      <button
        type="button"
        title="Zoom in"
        aria-label="Zoom in"
        className="plot-toolbar-button nopan grid h-8.5 w-8 touch-none place-items-center"
        {...zoomHoldEndHandlers}
        onPointerDown={(event) => startZoomHold(event, "in")}
        onClick={(event) => {
          if (event.detail === 0 || !didHoldZoom.current) stepZoom("in");
        }}
      >
        <Plus
          size={16}
          strokeWidth={1.75}
          className="plot-toolbar-icon"
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        title="Fit board"
        aria-label="Fit board"
        className="plot-toolbar-button grid h-8.5 w-8 place-items-center"
        onClick={() =>
          void fitView({
            ...viewportAnimation(boardMotion.fit),
            ...boardFitOptions,
          })
        }
      >
        <Scan
          size={16}
          strokeWidth={1.75}
          className="plot-toolbar-icon"
          aria-hidden="true"
        />
      </button>
    </>
  );
}
