import { boardZoomLimits } from "../boardViewport";

export function getNextZoomPercent(
  zoom: number,
  direction: "in" | "out",
): number {
  const current = Math.round(zoom * 100);
  const zoomingIn = direction === "in";

  // Move one point first so an exact stop always advances.
  const target = current + (zoomingIn ? 1 : -1);
  const step = target < 100 ? 5 : target < 200 ? 10 : 25;
  const round = zoomingIn ? Math.ceil : Math.floor;

  const { minZoom, maxZoom } = boardZoomLimits;
  const next = round(target / step) * step;
  return Math.max(minZoom * 100, Math.min(maxZoom * 100, next));
}
