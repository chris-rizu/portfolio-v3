// Generates public/models/avatar.glb from a portrait photo with Tripo (preferred) or Meshy.
//
//   node scripts/generate-avatar.mjs [path/to/photo.png]
//
// Reads TRIPO_API_KEY or MESHY_API_KEY from .env.local (never printed, never committed).
// The photo is cut out of its background first (python + rembg) because both services
// produce cleaner models from a subject on a plain background.
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const photo = process.argv[2] ?? "public/images/profile.png";
const work = ".assets-src/avatar";
const out = "public/models/avatar.glb";

async function readEnv() {
  const env = {};
  try {
    for (const line of (await fs.readFile(".env.local", "utf8")).split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // no .env.local
  }
  return env;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cutout() {
  await fs.mkdir(work, { recursive: true });
  const dest = path.join(work, "input.png");
  execFileSync("python", ["-c", `
from rembg import remove
from PIL import Image
im = Image.open(r"${photo}").convert("RGBA")
cut = remove(im)
bg = Image.new("RGBA", cut.size, (255, 255, 255, 255))
bg.alpha_composite(cut)
bg.convert("RGB").save(r"${dest}")
`], { stdio: "inherit" });
  console.log("cut out subject ->", dest);
  return dest;
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const raw = path.join(work, "avatar-raw.glb");
  await fs.writeFile(raw, Buffer.from(await res.arrayBuffer()));
  // web-friendly: webp textures, meshopt geometry
  execFileSync("npx", ["--yes", "@gltf-transform/cli", "optimize", raw, out, "--texture-compress", "webp", "--texture-size", "2048", "--compress", "meshopt"], {
    stdio: "inherit",
    shell: true,
  });
  console.log("saved", out);
}

async function tripo(key, image) {
  const base = "https://openapi.tripo3d.com/v3";
  const auth = { Authorization: `Bearer ${key}` };

  const form = new FormData();
  form.append("file", new Blob([await fs.readFile(image)], { type: "image/png" }), "input.png");
  const up = await (await fetch(`${base}/files`, { method: "POST", headers: auth, body: form })).json();
  if (up.code !== 0) throw new Error(`upload failed: ${JSON.stringify(up)}`);

  const create = await (
    await fetch(`${base}/generation/image-to-model`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        input: up.data.file_token,
        model: "v3.1-20260211",
        enable_image_autofix: true,
        orientation: "align_image",
        texture: true,
        pbr: true,
        texture_quality: "detailed",
        geometry_quality: "detailed",
        face_limit: 80000,
      }),
    })
  ).json();
  if (create.code !== 0) throw new Error(`task failed to start: ${JSON.stringify(create)}`);
  const id = create.data.task_id;
  console.log("tripo task", id);

  for (;;) {
    await sleep(5000);
    const t = await (await fetch(`${base}/tasks/${id}`, { headers: auth })).json();
    const { status, progress, output } = t.data ?? {};
    process.stdout.write(`\r${status} ${progress ?? 0}%   `);
    if (status === "success") return output.model_url ?? output.pbr_model ?? output.model;
    if (["failed", "banned", "expired", "cancelled", "unknown"].includes(status)) throw new Error(`task ${status}`);
  }
}

async function meshy(key, image) {
  const base = "https://api.meshy.ai/openapi/v1/image-to-3d";
  const auth = { Authorization: `Bearer ${key}` };
  const dataUri = `data:image/png;base64,${(await fs.readFile(image)).toString("base64")}`;
  const create = await (
    await fetch(base, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: dataUri, ai_model: "latest", enable_pbr: true, should_texture: true, should_remesh: true }),
    })
  ).json();
  if (!create.result) throw new Error(`task failed to start: ${JSON.stringify(create)}`);
  console.log("meshy task", create.result);
  for (;;) {
    await sleep(5000);
    const t = await (await fetch(`${base}/${create.result}`, { headers: auth })).json();
    process.stdout.write(`\r${t.status} ${t.progress ?? 0}%   `);
    if (t.status === "SUCCEEDED") return t.model_urls.glb;
    if (["FAILED", "CANCELED", "EXPIRED"].includes(t.status)) throw new Error(`task ${t.status}`);
  }
}

const env = await readEnv();
const key = env.TRIPO_API_KEY ? ["tripo", env.TRIPO_API_KEY] : env.MESHY_API_KEY ? ["meshy", env.MESHY_API_KEY] : null;
if (!key) {
  console.error("Add TRIPO_API_KEY=... (or MESHY_API_KEY=...) to .env.local first.");
  process.exit(1);
}
const image = await cutout();
const url = key[0] === "tripo" ? await tripo(key[1], image) : await meshy(key[1], image);
console.log("\nmodel ready, downloading…");
await download(url);
