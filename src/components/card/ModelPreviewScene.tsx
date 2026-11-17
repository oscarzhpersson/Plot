import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Box3, PMREMGenerator, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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
      scale: longestSide > 0 ? 2.1 / longestSide : 1,
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

type ModelPreviewSceneProps = {
  src: string;
  orbitEnabled: boolean;
  onFirstFrame: () => void;
  onPosterReady?: (poster: string) => void;
};

export default function ModelPreviewScene({
  src,
  orbitEnabled,
  onFirstFrame,
  onPosterReady,
}: ModelPreviewSceneProps) {
  return (
    <>
      <PreviewLighting />
      {orbitEnabled && <PreviewOrbitControls />}
      <ModelPreview
        src={src}
        onFirstFrame={onFirstFrame}
        onPosterReady={onPosterReady}
      />
    </>
  );
}
