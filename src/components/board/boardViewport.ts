import type { FitViewOptions } from "@xyflow/react";

export const boardZoomLimits = { minZoom: 0.25, maxZoom: 3 };

export const boardFitOptions = {
  padding: {
    top: "108px",
    right: "48px",
    bottom: "62px",
    left: "48px",
  },
} satisfies FitViewOptions;
