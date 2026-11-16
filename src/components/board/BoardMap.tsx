import { useLayoutEffect, useRef, useState } from "react";
import { MiniMap } from "@xyflow/react";

type BoardMapProps = {
  toolbarElement: HTMLDivElement | null;
};

const toolbarGap = 8;

export default function BoardMap({ toolbarElement }: BoardMapProps) {
  const mapLayer = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useLayoutEffect(() => {
    const layer = mapLayer.current;
    const minimap = layer?.querySelector(".react-flow__minimap");
    if (!layer || !minimap || !toolbarElement) return;

    const observer = new ResizeObserver(() => {
      const mapBounds = minimap.getBoundingClientRect();
      const toolbarBounds = toolbarElement.getBoundingClientRect();
      setHidden(
        mapBounds.left < toolbarBounds.right + toolbarGap &&
          mapBounds.right > toolbarBounds.left - toolbarGap &&
          mapBounds.top < toolbarBounds.bottom &&
          mapBounds.bottom > toolbarBounds.top,
      );
    });

    observer.observe(layer);
    observer.observe(minimap);
    observer.observe(toolbarElement);
    return () => observer.disconnect();
  }, [toolbarElement]);

  return (
    <div
      ref={mapLayer}
      className={`pointer-events-none absolute inset-0 ${hidden ? "invisible" : ""}`}
    >
      <MiniMap
        pannable
        className="pointer-events-auto rounded-xl border border-plot-border p-2.5
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
    </div>
  );
}
