"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * A studio to reflect. three.js's RoomEnvironment — a softbox-lit room, built from primitives,
 * no image files — pre-filtered into an environment map, so a physical material has something
 * real to mirror: the mannequin's polish, the car's clear coat. Lighting for the few meshes
 * that are not self-lit; the rest of each scene paints its own light.
 *
 * The pre-filter is a few dozen render passes: nothing on a GPU, seconds on a software
 * renderer. So it runs on the scene's first drawn frame, not when the scene mounts — opening
 * the page never waits on it, and a case study nobody scrolls to never pays for it. A render
 * harness drawing frame by frame gets it on its first frame, before anything is captured.
 */
export function useStudioEnv(intensity = 1): void {
  const { gl, scene } = useThree();
  const built = useRef<{ env: THREE.Texture; pmrem: THREE.PMREMGenerator } | null>(null);

  useFrame(() => {
    if (built.current) return;
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    scene.environment = env;
    scene.environmentIntensity = intensity;
    built.current = { env, pmrem };
  });

  useEffect(
    () => () => {
      const b = built.current;
      if (!b) return;
      scene.environment = null;
      b.env.dispose();
      b.pmrem.dispose();
      built.current = null;
    },
    [scene],
  );
}
