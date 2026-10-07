"use client";

import { useRef, useState, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import { Select } from "@react-three/postprocessing";
import { easing } from "maath";
import type { Group } from "three";
import { goTo, useStore } from "@/lib/store";

type Props = {
  /** Section id to scroll to on click. */
  to?: string;
  /** Custom click action instead of scrolling. */
  onSelect?: () => void;
  /** Short label shown on the marker, e.g. "PROJECTS". */
  label: string;
  /** What clicking does, shown under the label on hover. */
  hint?: string;
  /** Marker position, local to this hotspot. */
  labelAt?: [number, number, number];
  children: ReactNode;
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** How far the object lifts toward the viewer on hover (local +z). */
  lift?: number;
};

/**
 * Makes a scene object interactive: orange outline + label on hover, click to act.
 * On the overview shot every hotspot shows a pulsing marker so visitors can see what's clickable.
 */
export function Hotspot({ to, onSelect, label, hint, labelAt, children, position, rotation, lift = 0 }: Props) {
  const inner = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const station = useStore((s) => s.station);
  const ready = useStore((s) => s.ready);
  useCursor(hovered);

  useFrame((_, dt) => {
    if (inner.current) easing.damp(inner.current.position, "z", hovered ? lift : 0, 0.15, dt);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // ignore the click that ends a drag-to-look gesture
    if (e.delta > 6) return;
    if (onSelect) onSelect();
    else if (to) goTo(to);
  };

  const showMarker = ready && labelAt && (hovered || station === 0);

  return (
    <group position={position} rotation={rotation} onPointerOver={over} onPointerOut={() => setHovered(false)} onClick={click}>
      <Select enabled={hovered}>
        <group ref={inner}>{children}</group>
      </Select>
      {showMarker && (
        <Html position={labelAt} zIndexRange={[15, 0]} style={{ pointerEvents: "none" }}>
          <div className={`marker ${hovered ? "marker-on" : ""}`}>
            <i />
            <span>{label}</span>
            {hovered && hint && <em>{hint}</em>}
          </div>
        </Html>
      )}
    </group>
  );
}
