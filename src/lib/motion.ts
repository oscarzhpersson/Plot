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

export const boardFitPadding = { top: "108px", right: "48px", bottom: "62px", left: "48px" } as const;
