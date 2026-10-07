import * as THREE from "three";
import { awards, certifications, profile } from "@/data/portfolio";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Segoe UI', Arial, sans-serif";
const MONO = "Consolas, 'Courier New', monospace";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function toTexture(c: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
  return y;
}

export type FrameContent = { title: string; line1: string; line2: string; kind: "cert" | "award" };

export function frameContents(): FrameContent[] {
  return [
    ...certifications.map((c) => ({ title: c.name, line1: c.issuer, line2: c.date, kind: "cert" as const })),
    ...awards.map((a) => ({ title: a.name, line1: a.result, line2: a.date, kind: "award" as const })),
  ];
}

/** A printed certificate on cream paper (or a dark award plaque). Landscape, 1200 × 850. */
export function certificateTexture(content: FrameContent) {
  const W = 1200;
  const H = 850;
  const [c, ctx] = canvas(W, H);
  const award = content.kind === "award";
  const paper = award ? "#16130f" : "#f7f2e7";
  const ink = award ? "#f0d9a0" : "#2a2016";
  const accent = award ? "#d4a648" : "#8f6a35";

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);
  // subtle paper grain
  for (let i = 0; i < 9000; i++) {
    const v = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${v},${v},${v},${Math.random() * 0.025})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  ctx.strokeStyle = accent;
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.lineWidth = 2;
  ctx.strokeRect(62, 62, W - 124, H - 124);

  ctx.textAlign = "center";
  ctx.fillStyle = accent;
  ctx.font = `600 28px ${MONO}`;
  ctx.fillText(award ? "A W A R D" : "C E R T I F I C A T E", W / 2, 150);

  ctx.fillStyle = ink;
  ctx.font = `italic 38px ${SERIF}`;
  ctx.fillText(award ? "presented to" : "This certifies that", W / 2, 240);
  ctx.font = `bold 64px ${SERIF}`;
  ctx.fillText(profile.name, W / 2, 320);
  ctx.fillStyle = accent;
  ctx.fillRect(W / 2 - 220, 345, 440, 2);

  ctx.fillStyle = ink;
  ctx.font = `40px ${SANS}`;
  const y = wrapText(ctx, content.title, W / 2, 430, 900, 50);
  ctx.font = `bold 44px ${SANS}`;
  ctx.fillStyle = accent;
  ctx.fillText(content.line1, W / 2, y + 70);

  ctx.font = `30px ${MONO}`;
  ctx.fillStyle = ink;
  ctx.fillText(content.line2, W / 2, H - 120);

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(W - 190, H - 180, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = paper;
  ctx.font = `bold 46px ${SERIF}`;
  ctx.fillText("★", W - 190, H - 164);
  return toTexture(c);
}

/** Laptop screen idle state. */
export function terminalTexture() {
  const [c, ctx] = canvas(1440, 900);
  ctx.fillStyle = "#0b1016";
  ctx.fillRect(0, 0, 1440, 900);
  ctx.fillStyle = "#151c26";
  ctx.fillRect(0, 0, 1440, 54);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(32 + i * 30, 27, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  const lines: [string, string][] = [
    ["#4ade80", "chris@cebu:~$ whoami"],
    ["#e2e8f0", "Chris Paolo Caral — Computer & Software Engineer"],
    ["#4ade80", "chris@cebu:~$ ls ./projects"],
    ["#93c5fd", "sugbogas  govhub  banly  hotel-mgmt  receiptbot"],
    ["#93c5fd", "kana-quest  logistics-flow  nexusshift  lakbai ..."],
    ["#4ade80", "chris@cebu:~$ cat status.txt"],
    ["#fcd34d", "Open to opportunities ✦"],
    ["#4ade80", "chris@cebu:~$ █"],
  ];
  ctx.font = `38px ${MONO}`;
  lines.forEach(([col, text], i) => {
    ctx.fillStyle = col;
    ctx.fillText(text, 60, 150 + i * 88);
  });
  return toTexture(c);
}
