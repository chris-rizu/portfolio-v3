"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import { easing } from "maath";
import { Hotspot } from "./Hotspot";

const URL = "/models/avatar.glb";
/** Flip to true once scripts/generate-avatar.mjs has produced public/models/avatar.glb. */
export const hasAvatar = false;
/** Where the avatar stands: in the open floor between the desk and the armchair. */
const SPOT: [number, number, number] = [1.05, 0, -2.0];
/** Extra yaw if the generated model's front isn't +z. */
const FRONT_OFFSET = 0;

const LINES = [
  "Hi, I'm Chris 👋",
  "I build web apps for Cebu — SugboGas, GovHub, Lakbai.",
  "Software Engineer Intern at CIS right now.",
  "3rd place, Solana x AI Hackathon. 🏆",
  "Want to work together? Scroll down to contact me.",
];

/** Renders the photo-generated avatar once `public/models/avatar.glb` exists (see `hasAvatar`). */
export function AvatarSlot() {
  if (!hasAvatar) return null;
  return (
    <Suspense fallback={null}>
      <AvatarModel />
    </Suspense>
  );
}

function AvatarModel() {
  const { scene } = useGLTF(URL);
  const body = useRef<THREE.Group>(null);
  const [line, setLine] = useState<number | null>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Normalize whatever the generator produced: real-world height, feet on the floor, centered.
  const { obj, bust, scale, offset } = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const isBust = size.y / Math.max(size.x, size.z) < 1.6;
    const s = (isBust ? 0.62 : 1.72) / size.y;
    const center = box.getCenter(new THREE.Vector3());
    return {
      obj: c,
      bust: isBust,
      scale: s,
      offset: [-center.x * s, -box.min.y * s, -center.z * s] as [number, number, number],
    };
  }, [scene]);

  const plinth = bust ? 1.08 : 0;

  useFrame((state, dt) => {
    const g = body.current;
    if (!g) return;
    // turn toward the viewer, nudged by the pointer, never fully away from the room
    g.getWorldPosition(tmp);
    const yaw = Math.atan2(state.camera.position.x - tmp.x, state.camera.position.z - tmp.z) + state.pointer.x * 0.2;
    easing.damp(g.rotation, "y", THREE.MathUtils.clamp(yaw, -0.9, 0.9) + FRONT_OFFSET, 0.35, dt);
    // breathing
    g.scale.y = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.006;
  });

  return (
    <group position={SPOT}>
      {bust && (
        <mesh position={[0, plinth / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.42, plinth, 0.42]} />
          <meshStandardMaterial color="#b9b4ab" roughness={0.9} />
        </mesh>
      )}
      <Hotspot
        onSelect={() => setLine((l) => (l === null ? 0 : (l + 1) % LINES.length))}
        label="That's me"
        hint="Click to say hi"
        labelAt={[0.25, plinth + (bust ? 0.75 : 1.95), 0]}
      >
        <group ref={body} position={[0, plinth, 0]}>
          <primitive object={obj} scale={scale} position={offset} />
        </group>
      </Hotspot>
      {line !== null && (
        <Html position={[0.35, plinth + (bust ? 0.7 : 1.9), 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="speech" role="status">
            {LINES[line]}
          </div>
        </Html>
      )}
    </group>
  );
}
