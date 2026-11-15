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

  return Math.max(50, Math.min(300, round(target / step) * step));
}
