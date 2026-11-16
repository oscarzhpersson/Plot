import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import type { NodeProps } from "@xyflow/react";
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Box3, PMREMGenerator, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { BoardNode } from "@/data/boardSchema";
import { loadModelPoster, saveModelPoster } from "./modelPosterCache";
import BoardCard from "./BoardCard";

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

function PreviewLighting() {
  const getSceneState = useThree((state) => state.get);

  useEffect(() => {
    const { gl, scene, invalidate } = getSceneState();
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const reflections = generator.fromScene(room, 0.04);
    room.dispose();
    generator.dispose();

    const previousEnvironment = scene.environment;
    scene.environment = reflections.texture;
    invalidate();

    return () => {
      scene.environment = previousEnvironment;
      reflections.dispose();
    };
  }, [getSceneState]);

  return <directionalLight position={[3, 5, 4]} intensity={2} />;
}

function PreviewOrbitControls() {
  const getSceneState = useThree((state) => state.get);

  useEffect(() => {
    const { camera, gl, invalidate } = getSceneState();
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    const requestFrame = () => invalidate();
    controls.addEventListener("change", requestFrame);
    invalidate();

    return () => {
      controls.removeEventListener("change", requestFrame);
      controls.dispose();
    };
  }, [getSceneState]);

  return null;
}

function ModelPreview({
  src,
  onFirstFrame,
  onPosterReady,
}: {
  src: string;
  onFirstFrame: () => void;
  onPosterReady?: (poster: string) => void;
}) {
  const { scene } = useLoader(GLTFLoader, src);
  const getSceneState = useThree((state) => state.get);
  const aspect = useThree((state) =>
    state.size.height > 0 ? state.size.width / state.size.height : 1.15,
  );
  const fit = Math.min(1, aspect / 1.15);
  const { model, offset, scale } = useMemo(() => {
    const model = scene.clone();
    const bounds = new Box3().setFromObject(model);
    const size = bounds.getSize(new Vector3());
    const longestSide = Math.max(size.x, size.y, size.z);

    return {
      model,
      offset: bounds.getCenter(new Vector3()).negate(),
      scale: longestSide > 0 ? 2.6 / longestSide : 1,
    };
  }, [scene]);

  const firstFrame = useRef<number | null>(null);

  useFrame(() => {
    // The scene renders after useFrame callbacks, so reveal it on the next frame.
    if (firstFrame.current === null) {
      firstFrame.current = requestAnimationFrame(onFirstFrame);
    }
  });

  useEffect(() => () => {
    if (firstFrame.current !== null) cancelAnimationFrame(firstFrame.current);
    firstFrame.current = null;
  }, []);

  useEffect(() => {
    if (!onPosterReady) return;

    const frame = requestAnimationFrame(() => {
      const { gl, scene, camera } = getSceneState();
      const source = gl.domElement;
      if (!source.width || !source.height) return;

      const thumbnail = document.createElement("canvas");
      const ratio = Math.min(1, 480 / Math.max(source.width, source.height));
      thumbnail.width = Math.max(1, Math.round(source.width * ratio));
      thumbnail.height = Math.max(1, Math.round(source.height * ratio));
      const context = thumbnail.getContext("2d");
      if (!context) return;

      try {
        // Read the pixels immediately after rendering, before WebGL clears them.
        gl.render(scene, camera);
        context.drawImage(source, 0, 0, thumbnail.width, thumbnail.height);
        onPosterReady(thumbnail.toDataURL("image/webp", 0.82));
      } catch (error) {
        console.warn("Could not generate a model preview.", error);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [getSceneState, onPosterReady, scene]);

  return (
    <group scale={scale * fit}>
      <group position={offset}>
        <primitive object={model} />
      </group>
    </group>
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
              frameloop="demand"
              resize={{ offsetSize: true, scroll: false }}
              fallback={unavailable}
            >
              <PreviewLighting />
              {selected && <PreviewOrbitControls />}
              <ModelPreview
                src={src}
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
