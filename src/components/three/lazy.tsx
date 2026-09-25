"use client";

import dynamic from "next/dynamic";

/**
 * The 3D stage, split out of the first load. three.js is by far the heaviest thing on the
 * page; the static HTML and the first paint never wait for it, and a visitor with motion off
 * or no WebGL never downloads it at all.
 */
export const Stage3D = dynamic(() => import("@/components/three/Stage3D"), { ssr: false });
