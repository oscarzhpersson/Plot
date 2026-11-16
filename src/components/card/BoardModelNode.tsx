import { Canvas } from "@react-three/fiber";
import { useStore, type NodeProps } from "@xyflow/react";
import { Component, Suspense, useCallback, useState, type ReactNode } from "react";
import type { BoardNode } from "@/data/boardSchema";
import { loadModelPoster, saveModelPoster } from "./modelPosterCache";
import BoardCard from "./BoardCard";
import ModelPreviewScene from "./ModelPreviewScene";

type ModelNode = Extract<BoardNode, { type: "model" }>;

type PreviewBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

class PreviewBoundary extends Component<PreviewBoundaryProps> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function PreviewPoster({ src, status }: { src?: string; status?: string }) {
  return (
    <>
      {src && (
        <img
          className="h-full w-full object-contain"
          src={src}
          alt=""
          draggable={false}
        />
      )}
      {status && (
        <span
          role="status"
          className="absolute bottom-2 left-2 rounded-md bg-plot-surface px-2 py-1 text-xs text-plot-text-muted"
        >
          {status}
        </span>
      )}
    </>
  );
}

export default function BoardModelNode({
  data,
  selected,
  draggable,
  isConnectable,
}: NodeProps<ModelNode>) {
  return (
    <BoardCard
      title={data.label}
      subtitle={data.subtitle}
      selected={selected}
      draggable={draggable}
      isConnectable={isConnectable}
      badge="3D model"
    >
      <ModelCardPreview
        key={data.src}
        src={data.src}
        poster={data.poster}
        selected={selected && draggable}
      />
    </BoardCard>
  );
}

function ModelCardPreview({
  src,
  poster: suppliedPoster,
  selected,
}: {
  src: string;
  poster?: string;
  selected: boolean;
}) {
  const zoomedIn = useStore((state) => state.transform[2] >= 1.5);
  const previewDpr = selected && zoomedIn
    ? 2 * Math.min(window.devicePixelRatio, 2)
    : undefined;
  const [hasOpened, setHasOpened] = useState(selected);
  const [hasRendered, setHasRendered] = useState(false);
  const [generatedPoster, setGeneratedPoster] = useState(() => loadModelPoster(src));
  const [initialPoster] = useState(() => generatedPoster ?? suppliedPoster);
  if (selected && !hasOpened) setHasOpened(true);

  const onPosterReady = useCallback((image: string) => {
    setGeneratedPoster(image);
    saveModelPoster(src, image);
  }, [src]);

  const onFirstFrame = useCallback(() => setHasRendered(true), []);
  const showModel = hasOpened || selected;
  const unavailable = (
    <PreviewPoster src={generatedPoster ?? initialPoster} status="3D preview unavailable" />
  );
  const posterStatus = showModel ? "Loading model…" : initialPoster ? undefined : "Select to load model";

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-xl bg-plot-surface-muted ${selected ? "nodrag nopan cursor-grab active:cursor-grabbing" : ""}`}
    >
      <PreviewBoundary fallback={unavailable}>
        {showModel && (
          <Suspense fallback={null}>
            <Canvas
              camera={{ position: [3, 4, 4], fov: 23 }}
              dpr={previewDpr}
              frameloop="demand"
              resize={{ offsetSize: true, scroll: false }}
              fallback={unavailable}
            >
              <ModelPreviewScene
                src={src}
                orbitEnabled={selected}
                onFirstFrame={onFirstFrame}
                onPosterReady={generatedPoster ? undefined : onPosterReady}
              />
            </Canvas>
          </Suspense>
        )}
        <div
          aria-hidden={hasRendered}
          className={`pointer-events-none absolute inset-0 bg-plot-surface-muted motion-safe:transition-opacity motion-safe:duration-(--plot-motion-enter) motion-safe:ease-(--plot-motion-ease-enter) ${hasRendered ? "opacity-0" : "opacity-100"}`}
        >
          <PreviewPoster src={initialPoster} status={posterStatus} />
        </div>
      </PreviewBoundary>
    </div>
  );
}
