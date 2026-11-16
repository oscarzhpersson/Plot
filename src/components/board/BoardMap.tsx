import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MiniMap } from "@xyflow/react";
import type { CommentThread } from "@/data/commentStorage";

type BoardMapProps = {
  toolbarElement: HTMLDivElement | null;
  threads: CommentThread[];
};

type MapProjection = {
  svg: SVGSVGElement;
  left: number;
  right: number;
  top: number;
  bottom: number;
  unitsPerPixel: number;
};

const mapWidth = 178;
const mapHeight = 102;
const toolbarGap = 8;

export default function BoardMap({ toolbarElement, threads }: BoardMapProps) {
  const mapLayer = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const [projection, setProjection] = useState<MapProjection | null>(null);

  useLayoutEffect(() => {
    const layer = mapLayer.current;
    const minimap = layer?.querySelector(".react-flow__minimap");
    const svg = minimap?.querySelector("svg");
    if (!layer || !minimap || !svg) return;

    const updateProjection = () => {
      const { x, y, width, height } = svg.viewBox.baseVal;
      if (width <= 0 || height <= 0) return;

      const unitsPerPixel = Math.max(width / mapWidth, height / mapHeight);
      const margin = unitsPerPixel * 4;
      setProjection({
        svg,
        left: x + margin,
        right: x + width - margin,
        top: y + margin,
        bottom: y + height - margin,
        unitsPerPixel,
      });
    };

    const viewBoxObserver = new MutationObserver(updateProjection);
    viewBoxObserver.observe(svg, { attributes: true, attributeFilter: ["viewBox"] });

    const resizeObserver = new ResizeObserver(() => {
      updateProjection();
      if (!toolbarElement) return;

      const mapBounds = minimap.getBoundingClientRect();
      const toolbarBounds = toolbarElement.getBoundingClientRect();
      setHidden(
        mapBounds.left < toolbarBounds.right + toolbarGap &&
          mapBounds.right > toolbarBounds.left - toolbarGap &&
          mapBounds.top < toolbarBounds.bottom &&
          mapBounds.bottom > toolbarBounds.top,
      );
    });

    resizeObserver.observe(layer);
    resizeObserver.observe(minimap);
    if (toolbarElement) resizeObserver.observe(toolbarElement);

    return () => {
      resizeObserver.disconnect();
      viewBoxObserver.disconnect();
    };
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
        style={{ width: mapWidth, height: mapHeight, boxSizing: "content-box" }}
        ariaLabel="Minimap of board items and comments"
        bgColor="var(--plot-surface)"
        nodeColor="color-mix(in srgb, var(--plot-text-muted) 18%,
                    var(--plot-surface-muted))"
        maskColor="transparent"
        maskStrokeColor="var(--plot-accent)"
        maskStrokeWidth={1.5}
        offsetScale={10}
      />
      {projection && threads.length > 0 && createPortal(
        <g aria-hidden="true" pointerEvents="none">
          {threads.map(({ id, position, status }) => (
            <circle
              key={id}
              cx={Math.max(projection.left, Math.min(projection.right, position.x))}
              cy={Math.max(projection.top, Math.min(projection.bottom, position.y))}
              r={projection.unitsPerPixel * 3}
              fill={status === "resolved" ? "var(--plot-resolved)" : "var(--plot-accent)"}
              stroke="var(--plot-surface-muted)"
              strokeWidth={projection.unitsPerPixel}
            />
          ))}
        </g>,
        projection.svg,
      )}
    </div>
  );
}
