"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Sparkles, useTexture } from "@react-three/drei";

const WALL_H = 3.2;
/** Window opening in the back wall (z = -3). */
export const WIN = { x0: 1.55, x1: 3.25, y0: 0.9, y1: 2.45 };
/** Low golden-hour sun, shining in through the window. Shared with the scene lights. */
export const SUN_POS = new THREE.Vector3(6.5, 3.4, -10);
export const SUN_TARGET = new THREE.Vector3(1.4, 0.4, -0.8);

/** Loads a Poly Haven PBR set (diffuse, normal, AO/roughness/metal packed) tiled every `tile` meters. */
function usePbr(name: string, tile: number) {
  const [map, normalMap, arm] = useTexture(
    [`/textures/${name}_diff.jpg`, `/textures/${name}_nor.jpg`, `/textures/${name}_arm.jpg`],
    (loaded) => {
      const list = Array.isArray(loaded) ? loaded : [loaded];
      list.forEach((t, i) => {
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(1 / tile, 1 / tile);
        t.anisotropy = 8;
        if (i === 0) t.colorSpace = THREE.SRGBColorSpace;
      });
    },
  );
  return { map, normalMap, aoMap: arm, roughnessMap: arm, metalnessMap: arm };
}

/** World-space UVs (1 unit = 1 meter) so tiling is consistent across surfaces. */
function planarUVs(geo: THREE.BufferGeometry, axes: "xy" | "xz" | "zy") {
  const p = geo.attributes.position;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const [a, b] =
      axes === "xy" ? [p.getX(i), p.getY(i)] : axes === "xz" ? [p.getX(i), -p.getZ(i)] : [p.getZ(i), p.getY(i)];
    uv[i * 2] = a;
    uv[i * 2 + 1] = b;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

export function Room() {
  const oak = usePbr("oak_wood_planks", 2.2);
  const brick = usePbr("brick_wall_001", 1.6);
  const plaster = usePbr("painted_plaster_wall", 2.5);

  const backWall = useMemo(() => {
    const s = new THREE.Shape();
    // starts below the floor so light can't leak along the skirting
    s.moveTo(-4, -0.2);
    s.lineTo(4, -0.2);
    s.lineTo(4, WALL_H);
    s.lineTo(-4, WALL_H);
    s.closePath();
    const hole = new THREE.Path();
    hole.moveTo(WIN.x0, WIN.y0);
    hole.lineTo(WIN.x1, WIN.y0);
    hole.lineTo(WIN.x1, WIN.y1);
    hole.lineTo(WIN.x0, WIN.y1);
    hole.closePath();
    s.holes.push(hole);
    return planarUVs(new THREE.ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: false }), "xy");
  }, []);
  // floor runs under the walls so no light leaks along the skirting
  const floor = useMemo(() => planarUVs(new THREE.PlaneGeometry(8.6, 7.2).rotateX(-Math.PI / 2).translate(0, 0, 0.2), "xz"), []);
  const leftWall = useMemo(
    () => planarUVs(new THREE.PlaneGeometry(6.5, WALL_H).rotateY(Math.PI / 2).translate(-4, WALL_H / 2, 0.25), "zy"),
    [],
  );
  const rightWall = useMemo(
    () => planarUVs(new THREE.PlaneGeometry(6.5, WALL_H).rotateY(-Math.PI / 2).translate(4, WALL_H / 2, 0.25), "zy"),
    [],
  );

  return (
    <group>
      <mesh geometry={floor} receiveShadow>
        <meshStandardMaterial {...oak} roughness={1} metalness={1} envMapIntensity={0.6} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, WALL_H, 0.25]} castShadow receiveShadow>
        <planeGeometry args={[8, 6.5]} />
        <meshStandardMaterial color="#d8cfc4" roughness={1} />
      </mesh>
      {/* exposed brick back wall with the window cut out */}
      <mesh geometry={backWall} position={[0, 0, -3.18]} castShadow receiveShadow>
        <meshStandardMaterial {...brick} roughness={1} metalness={1} envMapIntensity={0.5} />
      </mesh>
      {[leftWall, rightWall].map((geo, i) => (
        <mesh key={i} geometry={geo} castShadow receiveShadow>
          <meshStandardMaterial {...plaster} color="#efe6da" roughness={1} metalness={1} envMapIntensity={0.5} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* skirting */}
      <mesh position={[-3.99, 0.06, 0.25]} receiveShadow>
        <boxGeometry args={[0.02, 0.12, 6.5]} />
        <meshStandardMaterial color="#2b2420" roughness={0.6} />
      </mesh>
      <Window />
      <SunShaft />
    </group>
  );
}

function Window() {
  const cx = (WIN.x0 + WIN.x1) / 2;
  const cy = (WIN.y0 + WIN.y1) / 2;
  const w = WIN.x1 - WIN.x0;
  const h = WIN.y1 - WIN.y0;
  const t = 0.055;
  const frame = <meshStandardMaterial color="#1d1b19" roughness={0.45} metalness={0.6} />;
  return (
    <group>
      {/* black steel frame, mullion and transom: an industrial loft window */}
      {[
        [cx, WIN.y1 - t / 2, w, t],
        [cx, WIN.y0 + t / 2, w, t],
        [WIN.x0 + t / 2, cy, t, h],
        [WIN.x1 - t / 2, cy, t, h],
        [cx, cy, w, 0.03],
        [cx, WIN.y0 + h * 0.75, w, 0.025],
        [cx - w / 4, cy, 0.025, h],
        [cx + w / 4, cy, 0.025, h],
      ].map(([x, y, fw, fh], i) => (
        <mesh key={i} position={[x, y, -3.1]} castShadow>
          <boxGeometry args={[fw, fh, 0.05]} />
          {frame}
        </mesh>
      ))}
      {/* concrete sill */}
      <mesh position={[cx, WIN.y0 - 0.02, -3.02]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.16, 0.05, 0.36]} />
        <meshStandardMaterial color="#9b958d" roughness={0.85} />
      </mesh>
      <mesh position={[cx, cy, -3.12]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.06} roughness={0} metalness={0} />
      </mesh>
    </group>
  );
}

/** Soft volumetric beam: an additive box fading along the sun direction, with dust motes. */
function SunShaft() {
  const { position, quaternion, length, material } = useMemo(() => {
    const dir = SUN_TARGET.clone().sub(SUN_POS).normalize();
    const start = new THREE.Vector3((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, -3.1);
    const len = 4.4;
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: { uColor: { value: new THREE.Color("#ffc78a") }, uLen: { value: len } },
      vertexShader: /* glsl */ `
        varying vec3 vPos;
        void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; uniform float uLen; varying vec3 vPos;
        void main() {
          float along = vPos.z / uLen + 0.5;
          float fade = pow(1.0 - along, 1.6) * smoothstep(0.0, 0.1, along);
          float edge = (1.0 - smoothstep(0.35, 0.95, abs(vPos.x) / 0.85)) * (1.0 - smoothstep(0.35, 0.95, abs(vPos.y) / 0.78));
          gl_FragColor = vec4(uColor, fade * edge * 0.045);
        }`,
    });
    return {
      position: start.clone().add(dir.clone().multiplyScalar(len / 2)),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir),
      length: len,
      material: mat,
    };
  }, []);

  return (
    <group position={position} quaternion={quaternion}>
      <mesh material={material}>
        <boxGeometry args={[1.7, 1.55, length]} />
      </mesh>
      <Sparkles count={60} scale={[1.3, 1.2, length * 0.85]} size={1.1} speed={0.12} opacity={0.4} color="#ffe1b0" />
    </group>
  );
}
