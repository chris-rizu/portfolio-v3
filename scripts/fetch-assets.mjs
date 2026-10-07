// Downloads CC0 assets from Poly Haven (https://polyhaven.com, CC0 1.0) into .assets-src/
import fs from "node:fs/promises";
import path from "node:path";

const MODELS = [
  "metal_office_desk", "desk_lamp_arm_01", "modern_arm_chair_01", "side_table_01",
  "steel_frame_shelves_01", "book_encyclopedia_set_01", "decorative_book_set_01",
  "potted_plant_01", "potted_plant_02", "potted_plant_04", "hanging_picture_frame_01",
  "industrial_pipe_lamp", "alarm_clock_01", "Camera_01",
];
const TEXTURES = ["oak_wood_planks", "painted_plaster_wall", "brick_wall_001"];
const HDRI = "sunset_jhbcentral";
const root = ".assets-src"; // raw downloads; optimized copies live in public/

async function get(url, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
}
const files = async (id) => (await fetch(`https://api.polyhaven.com/files/${id}`)).json();

for (const id of MODELS) {
  const info = await files(id);
  const g = info.gltf?.["1k"]?.gltf;
  if (!g) { console.log("no gltf, skipping", id, Object.keys(info).join(",")); continue; }
  try { await fs.access(path.join(root, "models", id)); console.log("have", id); continue; } catch {}
  const dir = path.join(root, "models", id);
  await get(g.url, path.join(dir, path.basename(g.url)));
  for (const [rel, f] of Object.entries(g.include)) await get(f.url, path.join(dir, rel));
  console.log("model", id);
}
for (const id of TEXTURES) {
  const f = await files(id);
  const pick = { diff: f.Diffuse, nor: f.nor_gl, arm: f.arm };
  for (const [k, v] of Object.entries(pick)) {
    if (!v) continue;
    await get(v["1k"].jpg.url, path.join(root, "textures", `${id}_${k}.jpg`));
  }
  console.log("texture", id);
}
const h = await files(HDRI);
await get(h.hdri["1k"].hdr.url, path.join(root, "hdri", `${HDRI}_1k.hdr`));
console.log("tonemapped keys:", Object.keys(h).join(","));
if (h.tonemapped) { await get(h.tonemapped.url, path.join(root, "hdri", `${HDRI}_tonemapped.jpg`)); console.log("tonemapped", h.tonemapped.size); }
