"use client";

import { Canvas, type RootState } from "@react-three/fiber";
import { DriveScene } from "@/components/three/DriveScene";
import { EvidenceScene } from "@/components/three/EvidenceScene";
import { HeroField } from "@/components/three/HeroField";
import { PoseScene } from "@/components/three/PoseScene";
import type { Drive } from "@/components/three/core";

export type SceneKind = "hero" | "evidence" | "drive" | "pose";

type Props = {
  scene: SceneKind;
  drive: Drive;
  /** Render continuously. Off-screen scenes pass false and stop drawing entirely. */
  active: boolean;
  className?: string;
  /** A render harness drives frames itself with `advance()`. */
  capture?: boolean;
  /** Fewer particles on a small or low-power screen. */
  lite?: boolean;
  onReady?: (state: RootState) => void;
};

const CAMERA = {
  hero: { fov: 45, position: [0, 0, 6.4] as [number, number, number] },
  evidence: { fov: 38, position: [1, 3, 9] as [number, number, number] },
  drive: { fov: 42, position: [0, 7, 12] as [number, number, number] },
  pose: { fov: 38, position: [0, 2, 8.6] as [number, number, number] },
};

/**
 * The one <Canvas> every 3D scene is drawn in — loaded lazily, never on the server.
 *
 * The loop only runs while the scene is on screen (`frameloop: "never"` otherwise), so a page
 * with four WebGL scenes costs one scene's worth of GPU at a time. The hero is transparent, so
 * the CSS aurora behind it shows through; the case-study scenes paint their own ground.
 */
export default function Stage3D({ scene, drive, active, className, capture = false, lite = false, onReady }: Props) {
  const cam = CAMERA[scene];
  return (
    <Canvas
      className={className}
      frameloop={capture ? "never" : active ? "always" : "never"}
      dpr={capture ? 1 : lite ? [1, 1.25] : [1, 1.75]}
      // Measure layout size, not the on-screen box: the stage mounts mid-reveal at scale(0.94),
      // and a transform never fires a resize, so a bounding-rect canvas would stay 6% short.
      resize={{ offsetSize: true, scroll: false }}
      camera={{ fov: cam.fov, near: 0.1, far: 90, position: cam.position }}
      gl={{
        antialias: true,
        alpha: scene === "hero",
        powerPreference: "high-performance",
        preserveDrawingBuffer: capture,
      }}
      onCreated={(state) => {
        // A capture is a picture on its own, so even the hero gets its ground painted in.
        if (scene !== "hero" || capture) state.gl.setClearColor("#05060a", 1);
        onReady?.(state);
      }}
      aria-hidden="true"
    >
      {scene === "hero" && <HeroField drive={drive} count={lite ? 7000 : 16000} />}
      {scene === "evidence" && <EvidenceScene drive={drive} />}
      {scene === "drive" && <DriveScene drive={drive} />}
      {scene === "pose" && <PoseScene drive={drive} />}
    </Canvas>
  );
}
