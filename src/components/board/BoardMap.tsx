import { MiniMap } from "@xyflow/react";

export default function BoardMap() {
  return (
    <MiniMap
      pannable
      className="rounded-xl border border-plot-border p-2.5
                    shadow [&>svg]:rounded-lg [&>svg]:bg-plot-surface-muted"
      style={{ width: 178, height: 102, boxSizing: "content-box" }}
      bgColor="var(--plot-surface)"
      nodeColor="color-mix(in srgb, var(--plot-text-muted) 18%,
                    var(--plot-surface-muted))"
      maskColor="transparent"
      maskStrokeColor="var(--plot-accent)"
      maskStrokeWidth={1.5}
      offsetScale={10}
    />
  );
}
