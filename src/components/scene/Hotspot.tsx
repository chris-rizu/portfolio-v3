"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import { easing } from "maath";
import type { Group } from "three";
import { goTo } from "@/lib/store";

type Props = {
  /** Section id to scroll to on click. */
  to: string;
  children: ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** How far the object lifts toward the viewer on hover (local +z). */
  lift?: number;
};

/** Wraps a scene object so it reacts to hover and jumps to its section on click. */
export function Hotspot({ to, children, position, rotation, lift = 0.02 }: Props) {
  const inner = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((_, dt) => {
    if (!inner.current) return;
    easing.damp(inner.current.position, "z", hovered ? lift : 0, 0.15, dt);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };

  return (
    <group
      position={position}
      rotation={rotation}
      onPointerOver={over}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        goTo(to);
      }}
    >
      <group ref={inner}>{children}</group>
    </group>
  );
}
