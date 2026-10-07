"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, PerformanceMonitor, useTexture } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, Outline, Selection, SMAA, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { easing } from "maath";
import { Room, SUN_POS, SUN_TARGET } from "./Room";
import { Furniture } from "./Furniture";
import { AvatarSlot } from "./AvatarModel";
import { stations } from "@/lib/stations";
import { rig, setState, useStore } from "@/lib/store";

/** Turns the HDRI so the sunset skyline sits in the window. */
const VIEW_ROT = -0.45;
const SIGNAL = 0xff5a1f;

export default function Workshop() {
  const [lowPower, setLowPower] = useState(false);
  const night = useStore((s) => s.night);
  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      camera={{ fov: 40, near: 0.05, far: 60, position: stations[0].pos }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#0d0d0c"]} />
      <PerformanceMonitor onDecline={() => setLowPower(true)} />
      <Selection>
        <Suspense fallback={null}>
          <Lights night={night} />
          <Room />
          <Furniture />
          <AvatarSlot />
          {/* real sunset HDRI: soft image-based light for the interior, and the city view through the window */}
          <Environment
            files="/hdri/sunset_jhbcentral_1k.hdr"
            environmentIntensity={night ? 0.06 : 0.28}
            environmentRotation={[0, VIEW_ROT, 0]}
          />
          <WindowView night={night} />
          <ReadySignal />
        </Suspense>
        <CameraRig />
        {lowPower ? (
          <EffectComposer multisampling={0} autoClear={false}>
            <Outline blur edgeStrength={5} visibleEdgeColor={SIGNAL} hiddenEdgeColor={SIGNAL} />
            <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.7} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        ) : (
          <EffectComposer multisampling={0} autoClear={false}>
            <N8AO halfRes aoRadius={0.45} intensity={2.2} distanceFalloff={0.6} />
            <Outline blur edgeStrength={5} visibleEdgeColor={SIGNAL} hiddenEdgeColor={SIGNAL} />
            <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.7} />
            <Vignette offset={0.25} darkness={0.55} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            <SMAA />
          </EffectComposer>
        )}
      </Selection>
    </Canvas>
  );
}

function Lights({ night }: { night: boolean }) {
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.copy(SUN_TARGET);
    return o;
  }, []);
  return (
    <>
      <primitive object={target} />
      {/* low golden-hour sun pouring through the window; cool moonlight at night */}
      <directionalLight
        position={SUN_POS}
        target={target}
        intensity={night ? 0.5 : 4.5}
        color={night ? "#8fa6ff" : "#ffb46b"}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.008}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={26}
      />
      <hemisphereLight args={[night ? "#6b7bb0" : "#ffe2c2", "#3a2a20", night ? 0.12 : 0.35]} />
      {/* warm bounce off the floor near the window, cool fill from the open side of the room */}
      <pointLight position={[2.3, 0.6, -1.4]} intensity={night ? 0 : 2.4} distance={5} decay={2} color="#ffa866" />
      <pointLight position={[0, 2.6, 2.2]} intensity={night ? 0.5 : 2.2} distance={9} decay={2} color="#b8c6ff" />
    </>
  );
}

/** The high-res sunset panorama, seen only through the window. */
function WindowView({ night }: { night: boolean }) {
  const view = useTexture("/hdri/sunset_jhbcentral_view.jpg", (t) => {
    const tex = Array.isArray(t) ? t[0] : t;
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
  });
  const get = useThree((s) => s.get);
  useEffect(() => {
    const scene = get().scene;
    const prev = scene.background;
    scene.background = view;
    scene.backgroundRotation.set(0, VIEW_ROT, 0);
    return () => {
      scene.background = prev;
    };
  }, [get, view]);
  useFrame((state, dt) => {
    easing.damp(state.scene, "backgroundIntensity", night ? 0.16 : 1.15, 0.4, dt);
  });
  return null;
}

/** Mounted once everything inside Suspense (textures, screenshots) has loaded. */
function ReadySignal() {
  useEffect(() => {
    setState({ ready: true, waveAt: performance.now() + 700 });
  }, []);
  return null;
}

const posA = new THREE.Vector3();
const posB = new THREE.Vector3();
const targetA = new THREE.Vector3();
const targetB = new THREE.Vector3();
const lookAt = new THREE.Vector3(...stations[0].target);
const UP = new THREE.Vector3(0, 1, 0);
const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * Follows the scroll-driven station value and keeps the subject clear of the reading panel.
 * Mouse users can also drag to glance around; the view springs back on release.
 */
function CameraRig() {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const look = useRef({ yaw: 0, pitch: 0, tYaw: 0, tPitch: 0 });
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    const camera = get().camera as THREE.PerspectiveCamera;
    const { width: w, height: h } = size;
    if (w >= 1024) {
      camera.setViewOffset(w, h, -w * 0.17, 0, w, h);
      camera.fov = 40;
    } else {
      camera.setViewOffset(w, h, 0, h * 0.2, w, h);
      camera.fov = w < h ? 58 : 46;
    }
    camera.updateProjectionMatrix();
  }, [get, size]);

  useEffect(() => {
    const el = get().gl.domElement;
    let start: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button === 0) start = { x: e.clientX, y: e.clientY };
    };
    const move = (e: PointerEvent) => {
      if (!start) return;
      const l = look.current;
      l.tYaw = THREE.MathUtils.clamp(-(e.clientX - start.x) * 0.004, -0.55, 0.55);
      l.tPitch = THREE.MathUtils.clamp(-(e.clientY - start.y) * 0.003, -0.28, 0.28);
    };
    const up = () => {
      start = null;
      look.current.tYaw = 0;
      look.current.tPitch = 0;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [get]);

  useFrame((state, dt) => {
    const camera = state.camera;
    const n = stations.length - 1;
    const s = THREE.MathUtils.clamp(rig.s, 0, n);
    const i = Math.min(Math.floor(s), n - 1);
    const f = smooth(s - i);
    posA.set(...stations[i].pos).lerp(posB.set(...stations[i + 1].pos), f);
    targetA.set(...stations[i].target).lerp(targetB.set(...stations[i + 1].target), f);
    // pull back and up mid-transition so the camera never cuts through furniture
    const arc = Math.sin(f * Math.PI);
    posA.y += arc * 0.25;
    posA.z += arc * 0.6;
    // subtle parallax from the pointer
    if (!reduced) {
      posA.x += state.pointer.x * 0.06;
      posA.y += state.pointer.y * 0.04;
    }
    const lag = reduced ? 0.05 : 0.35;
    easing.damp3(camera.position, posA, lag, dt);
    easing.damp3(lookAt, targetA, lag, dt);
    camera.lookAt(lookAt);

    const l = look.current;
    l.yaw = THREE.MathUtils.damp(l.yaw, l.tYaw, 8, dt);
    l.pitch = THREE.MathUtils.damp(l.pitch, l.tPitch, 8, dt);
    camera.rotateOnWorldAxis(UP, l.yaw);
    camera.rotateX(l.pitch);
  });

  return null;
}
