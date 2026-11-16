export const boardMotion = {
  zoom: 180,
  fit: 220,
} as const;

export function viewportAnimation(duration: number) {
  return {
    duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : duration,
  };
}
