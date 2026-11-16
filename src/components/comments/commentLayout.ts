import type { XYPosition } from "@xyflow/react";

export type CanvasRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type CommentViewport = {
  width: number;
  height: number;
  scale: number;
};

const inset = 8;
const pinSize = 32;
const composerWidth = 320;
export const minimumSidebarWidth = 300;
const defaultSidebarWidth = 400;
const maximumSidebarWidth = 640;

function intersects(a: CanvasRect, b: CanvasRect) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function placeCommentComposer(
  anchor: XYPosition,
  viewport: CommentViewport,
  formHeight: number,
  controls: CanvasRect[],
) {
  const { scale } = viewport;
  const width = Math.max(1, Math.min(composerWidth, (viewport.width - 2 * inset) / scale));
  const maxHeight = Math.max(1, (viewport.height - 2 * inset) / scale);
  const screenWidth = width * scale;
  const screenHeight = Math.min(formHeight, maxHeight) * scale;
  const pin = {
    left: anchor.x,
    top: anchor.y - pinSize * scale,
    right: anchor.x + pinSize * scale,
    bottom: anchor.y,
  };
  const rightLimit = Math.max(inset, viewport.width - inset - screenWidth);
  const bottomLimit = Math.max(inset, viewport.height - inset - screenHeight);

  const candidates = [
    { x: pin.right + inset, y: pin.top },
    { x: pin.left - inset - screenWidth, y: pin.top },
    { x: pin.left, y: pin.top - inset - screenHeight },
    { x: pin.left, y: pin.bottom + inset },
    ...controls.map(({ top }) => ({ x: pin.left, y: top - inset - screenHeight })),
  ].map(({ x, y }) => {
    const left = Math.max(inset, Math.min(x, rightLimit));
    const top = Math.max(inset, Math.min(y, bottomLimit));
    return { left, top, right: left + screenWidth, bottom: top + screenHeight };
  });

  const obstacles = [pin, ...controls];
  const position = candidates.find((candidate) =>
    obstacles.every((obstacle) => !intersects(candidate, obstacle)),
  ) ?? candidates[0];

  return {
    width,
    maxHeight,
    left: (position.left - pin.left) / scale,
    top: (position.top - pin.top) / scale,
  };
}

export function getCommentsPanelLayout(
  workspaceWidth: number,
  sidebarRoom: number,
  preferredWidth: number | null,
) {
  const maxWidth = Math.min(maximumSidebarWidth, sidebarRoom);
  const docked = maxWidth >= minimumSidebarWidth;
  const width = docked
    ? Math.min(maxWidth, preferredWidth ?? Math.max(defaultSidebarWidth, Math.round(workspaceWidth / 4)))
    : Math.min(defaultSidebarWidth, Math.max(0, workspaceWidth - inset));

  return { width, maxWidth, docked };
}
