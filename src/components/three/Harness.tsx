"use client";

import { useEffect, useRef, useState } from "react";
import { advance, type RootState } from "@react-three/fiber";
import Stage3D, { type SceneKind } from "@/components/three/Stage3D";
import { createDrive } from "@/components/three/core";

type RecordOpts = {
  fps?: number;
  seconds?: number;
  bitrate?: number;
  /** The scene position the clip runs across. */
  from?: number;
  to?: number;
  /** Fraction of the clip held on the last frame's position (time still runs), before it loops. */
  hold?: number;
};

declare global {
  interface Window {
    __stage?: {
      ready: boolean;
      frame: (p: number, t: number) => void;
      still: (p: number, t: number, type?: string, quality?: number) => string;
      record: (opts: RecordOpts) => Promise<string>;
    };
  }
}

const SCENES: SceneKind[] = ["hero", "evidence", "drive", "pose"];

/**
 * Deterministic rendering of any 3D scene, for the media that ship with the site.
 *
 * The scene is mounted with its loop stopped and `drive.capture` set, so nothing moves unless
 * this sets (p, t) and calls `advance()`. `record()` then walks the timeline frame by frame —
 * each frame rendered exactly, however long the software rasteriser takes — and hands every
 * frame to WebCodecs through mediabunny, which muxes a VP9 WebM in memory. The result comes
 * back to the Node script as base64. No screen recorder, no ffmpeg, and no dropped frames.
 */
export function Harness() {
  const [cfg, setCfg] = useState<{ scene: SceneKind; w: number; h: number } | null>(null);
  const drive = useRef(createDrive());
  const root = useRef<RootState | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const scene = (SCENES.find((s) => s === q.get("scene")) ?? "evidence") as SceneKind;
    const raf = requestAnimationFrame(() =>
      setCfg({ scene, w: Number(q.get("w")) || 1280, h: Number(q.get("h")) || 720 }),
    );
    return () => cancelAnimationFrame(raf);
  }, []);

  const onReady = (state: RootState) => {
    root.current = state;
    const d = drive.current;
    d.capture = true;
    const frame = (p: number, t: number) => {
      d.p = p;
      d.t = t;
      d.target = p;
      advance(t * 1000, true, state);
    };
    window.__stage = {
      ready: true,
      frame,
      still: (p, t, type = "image/webp", quality = 0.9) => {
        frame(p, t);
        return state.gl.domElement.toDataURL(type, quality);
      },
      record: async ({ fps = 30, seconds = 8, bitrate = 2_400_000, from = 0, to = 1, hold = 0 }) => {
        const { Output, WebMOutputFormat, BufferTarget, CanvasSource } = await import("mediabunny");
        const output = new Output({ format: new WebMOutputFormat(), target: new BufferTarget() });
        const source = new CanvasSource(state.gl.domElement, { codec: "vp9", bitrate, keyFrameInterval: 2 });
        output.addVideoTrack(source, { frameRate: fps });
        await output.start();
        const n = Math.round(fps * seconds);
        for (let f = 0; f < n; f++) {
          const t = f / fps;
          const k = Math.min(1, f / Math.max(1, (n - 1) * (1 - hold)));
          frame(from + (to - from) * k, t);
          await source.add(t, 1 / fps);
        }
        await output.finalize();
        const buf = new Uint8Array(output.target.buffer ?? new ArrayBuffer(0));
        let bin = "";
        for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
        return btoa(bin);
      },
    };
    frame(0, 0);
  };

  if (!cfg) return null;
  return (
    <div style={{ width: cfg.w, height: cfg.h, background: "#05060a" }} data-scene={cfg.scene}>
      <Stage3D scene={cfg.scene} drive={drive.current} active={false} capture onReady={onReady} />
    </div>
  );
}
