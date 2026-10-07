"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements, type ThreeEvent } from "@react-three/fiber";
import { RoundedBox, useCursor, useGLTF, useTexture } from "@react-three/drei";
import { Hotspot } from "./Hotspot";
import { certificateTexture, frameContents, terminalTexture } from "./textures";
import { projects } from "@/data/portfolio";
import { getState } from "@/lib/store";

/** Desk surface height of the metal office desk model. */
const TOP = 0.787;

const MODELS = [
  "metal_office_desk", "desk_lamp_arm_01", "modern_arm_chair_01", "side_table_01", "steel_frame_shelves_01",
  "book_encyclopedia_set_01", "potted_plant_01", "potted_plant_02", "potted_plant_04", "hanging_picture_frame_01",
  "industrial_pipe_lamp", "alarm_clock_01", "Camera_01",
] as const;
MODELS.forEach((m) => useGLTF.preload(`/models/${m}.glb`));

/** Clones a loaded model so it can be placed more than once; `swap` can replace materials by name. */
function useModel(name: (typeof MODELS)[number], swap?: (mat: THREE.Material) => THREE.Material | undefined) {
  const { scene } = useGLTF(`/models/${name}.glb`);
  return useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      m.receiveShadow = true;
      if (swap && !Array.isArray(m.material)) m.material = swap(m.material) ?? m.material;
    });
    return c;
    // swap is a fresh closure each render; the clone only depends on the source scene
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);
}

type ModelProps = ThreeElements["group"] & { name: (typeof MODELS)[number] };

function Model({ name, ...props }: ModelProps) {
  const obj = useModel(name);
  return (
    <group {...props}>
      <primitive object={obj} />
    </group>
  );
}

export function Furniture() {
  return (
    <group>
      {/* desk wall */}
      <Model name="metal_office_desk" position={[-0.3, 0, -2.5]} />
      <group position={[-0.38, TOP, -2.42]} rotation-y={0.08}>
        <Hotspot to="projects" lift={0}>
          <Laptop />
        </Hotspot>
      </group>
      <DeskLamp />
      <Model name="potted_plant_04" position={[0.42, TOP, -2.72]} />
      <Model name="alarm_clock_01" position={[0.12, TOP, -2.78]} rotation-y={-0.35} />

      {/* skills shelf */}
      <Hotspot to="skills" position={[-2.4, 0, -2.76]} lift={0}>
        <Model name="steel_frame_shelves_01" scale={0.085} />
        <Model name="book_encyclopedia_set_01" position={[-0.4, 0.93, -0.02]} />
        <Model name="Camera_01" position={[0.12, 1.36, 0]} rotation-y={-0.5} />
        <Model name="potted_plant_04" position={[-0.25, 1.36, 0]} scale={0.85} />
        <Model name="alarm_clock_01" position={[0.25, 0.52, 0]} rotation-y={0.3} />
      </Hotspot>
      <Model name="potted_plant_01" position={[-3.45, 0, -2.55]} />

      {/* reading corner by the window */}
      <Model name="modern_arm_chair_01" position={[2.15, 0, -1.65]} rotation-y={-0.55} />
      <Model name="side_table_01" position={[3.3, 0, -2.35]} rotation-y={-0.2} />
      <PipeLamp position={[3.3, 0.548, -2.35]} />
      <Model name="potted_plant_02" position={[3.45, 0, -0.85]} />

      <FrameWall />
    </group>
  );
}

/** Clickable desk lamp: toggles its bulb and spotlight. */
function DeskLamp() {
  const [on, setOn] = useState(true);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const lamp = useRef<THREE.Group>(null);
  const obj = useModel("desk_lamp_arm_01", (mat) => {
    if (mat.name !== "desk_lamp_arm_01_light") return undefined;
    const bulb = new THREE.MeshStandardMaterial({ color: "#fff4e0", emissive: "#ffd7a1", emissiveIntensity: 6 });
    bulb.toneMapped = false;
    bulb.name = "bulb";
    return bulb;
  });
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-0.3, TOP, -2.4);
    return o;
  }, []);

  useLayoutEffect(() => {
    lamp.current?.traverse((o) => {
      const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (mat?.name === "bulb") mat.emissiveIntensity = on ? 6 : 0;
    });
  }, [on]);

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setOn((v) => !v);
  };

  return (
    <group>
      <primitive object={target} />
      <group
        ref={lamp}
        position={[-1.08, TOP, -2.72]}
        rotation-y={-Math.PI / 2 + 0.35}
        onClick={click}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <primitive object={obj} />
      </group>
      <spotLight
        position={[-0.95, 1.5, -2.45]}
        target={target}
        angle={0.6}
        penumbra={0.75}
        intensity={on ? 5 : 0}
        distance={3}
        decay={2}
        color="#ffcf9a"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
    </group>
  );
}

function PipeLamp(props: ThreeElements["group"]) {
  const glow = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color: "#fff0d8", emissive: "#ffb860", emissiveIntensity: 4, transparent: true, opacity: 0.9 });
    m.toneMapped = false;
    return m;
  }, []);
  const obj = useModel("industrial_pipe_lamp", (mat) => (mat.name === "industrial_pipe_lamp_glass" ? glow : undefined));
  return (
    <group {...props}>
      <primitive object={obj} />
      <pointLight position={[0, 0.25, 0.05]} intensity={1.6} distance={3.2} decay={2} color="#ffb565" />
    </group>
  );
}

/** Certificates and award plaques printed into real picture frames on the left wall. */
function FrameWall() {
  const { scene } = useGLTF("/models/hanging_picture_frame_01.glb");
  const frames = useMemo(
    () =>
      frameContents().map((content) => {
        const c = scene.clone(true);
        const tex = certificateTexture(content);
        tex.flipY = false;
        // the frame model is portrait; it hangs on its side, so turn the print to match
        tex.center.set(0.5, 0.5);
        tex.rotation = Math.PI / 2;
        c.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          m.castShadow = true;
          const mat = m.material as THREE.MeshStandardMaterial;
          if (mat.name === "hanging_picture_frame_01_artwork") {
            // a touch of self-light keeps the print readable on the shaded wall
            m.material = new THREE.MeshStandardMaterial({
              map: tex,
              emissiveMap: tex,
              emissive: new THREE.Color("#ffffff"),
              emissiveIntensity: 0.22,
              roughness: 0.8,
            });
          } else if (mat.name === "hanging_picture_frame_01_glass") {
            m.material = new THREE.MeshPhysicalMaterial({
              color: "#ffffff",
              transparent: true,
              opacity: 0.08,
              roughness: 0.05,
              depthWrite: false,
            });
            m.castShadow = false;
          }
        });
        return { content, obj: c };
      }),
    [scene],
  );

  const wallTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-3.99, 1.55, -1.5);
    return o;
  }, []);

  const certs = frames.filter((f) => f.content.kind === "cert");
  const awards = frames.filter((f) => f.content.kind === "award");
  const layout = [
    ...certs.map((f, i) => ({ f, x: 1.75 - i * 1.0, y: 1.9 })),
    ...awards.map((f, i) => ({ f, x: 1.25 - i * 1.0, y: 1.2 })),
  ];

  return (
    <>
      {/* gallery light washing the frame wall */}
      <primitive object={wallTarget} />
      <spotLight position={[-2.4, 2.95, -1.5]} target={wallTarget} angle={0.95} penumbra={0.9} intensity={6} distance={4.5} decay={2} color="#ffe2bf" />
      <group position={[-3.99, 0, -0.75]} rotation-y={Math.PI / 2}>
        {layout.map(({ f, x, y }) => (
          <Hotspot key={f.content.title} to="certifications" position={[x, y, 0]} lift={0.025}>
            <group rotation-z={Math.PI / 2}>
              <primitive object={f.obj} />
            </group>
          </Hotspot>
        ))}
      </group>
    </>
  );
}

const LAPTOP = { w: 0.312, d: 0.221, base: 0.0155, lid: 0.006, open: 1.92 };

/** A modern aluminium laptop whose screen shows the project being read. */
function Laptop() {
  const shots = useTexture(projects.map((p) => p.image));
  const terminal = useMemo(() => terminalTexture(), []);
  const screen = useRef<THREE.MeshBasicMaterial>(null);
  const keys = useRef<THREE.InstancedMesh>(null);
  const shown = useRef(-2);
  const fade = useRef(0);

  useLayoutEffect(() => {
    shots.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
    });
    const m = new THREE.Matrix4();
    let i = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 14; c++) {
        m.makeTranslation(-0.1235 + c * 0.019, 0, -0.088 + r * 0.0185);
        keys.current!.setMatrixAt(i++, m);
      }
    }
    keys.current!.instanceMatrix.needsUpdate = true;
  }, [shots]);

  useFrame(({ clock }, dt) => {
    const mat = screen.current;
    if (!mat) return;
    const { project, station } = getState();
    // at the desk and projects stops the screen cycles through the work; elsewhere it idles on the terminal
    const auto = station === 1 || station === 3 ? Math.floor(clock.elapsedTime / 3.5) % shots.length : -1;
    const want = project >= 0 ? project : auto;
    if (want !== shown.current) {
      shown.current = want;
      mat.map = want >= 0 ? shots[want] : terminal;
      mat.needsUpdate = true;
      fade.current = 1;
    }
    fade.current = Math.max(0, fade.current - dt * 3);
    const b = 0.95 - fade.current * 0.75;
    mat.color.setRGB(b, b, b);
  });

  const alu = <meshStandardMaterial color="#c4c8ce" metalness={1} roughness={0.32} />;
  return (
    <group>
      <RoundedBox args={[LAPTOP.w, LAPTOP.base, LAPTOP.d]} radius={0.006} smoothness={4} position={[0, LAPTOP.base / 2, 0]} castShadow receiveShadow>
        {alu}
      </RoundedBox>
      <mesh position={[0, LAPTOP.base + 0.0002, -0.05]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.285, 0.1]} />
        <meshStandardMaterial color="#1b1c1f" roughness={0.7} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, 70]} position={[0, LAPTOP.base + 0.0012, 0]} castShadow>
        <boxGeometry args={[0.0165, 0.0018, 0.0158]} />
        <meshStandardMaterial color="#121315" roughness={0.55} />
      </instancedMesh>
      <mesh position={[0, LAPTOP.base + 0.0003, 0.058]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.125, 0.078]} />
        <meshStandardMaterial color="#b4b8be" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* lid, hinged at the back edge */}
      <group position={[0, LAPTOP.base, -LAPTOP.d / 2]} rotation-x={-LAPTOP.open}>
        <RoundedBox args={[LAPTOP.w, LAPTOP.lid, LAPTOP.d]} radius={0.003} smoothness={4} position={[0, LAPTOP.lid / 2, LAPTOP.d / 2]} castShadow>
          {alu}
        </RoundedBox>
        <mesh position={[0, -0.0004, LAPTOP.d / 2]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[0.304, 0.213]} />
          <meshStandardMaterial color="#050506" roughness={0.15} metalness={0.2} />
        </mesh>
        <mesh position={[0, -0.0008, LAPTOP.d / 2 + 0.006]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[0.288, 0.18]} />
          <meshBasicMaterial ref={screen} map={terminal} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[0, 0.16, 0.12]} intensity={0.35} distance={0.9} decay={2} color="#c7d7ff" />
    </group>
  );
}
