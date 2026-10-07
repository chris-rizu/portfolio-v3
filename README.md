# Chris Paolo Caral — The Workshop

Portfolio v3: a walk-through 3D room at golden hour. Scrolling moves the camera from the desk to the
bookshelf, the reading corner and the certificate wall, while the content reads alongside it.
The Work section is a full gallery with a detail view for every project.

Classic version: [chrispaolo.dev](https://chrispaolo.dev)

## Stack

- Next.js 16 (App Router) + TypeScript
- React Three Fiber, drei, postprocessing (N8AO, bloom, ACES tone mapping)
- Photo-scanned CC0 models, textures and HDRI from [Poly Haven](https://polyhaven.com)

## Run it

```bash
npm install
npm run dev
```

## Where things live

| Path | What |
| --- | --- |
| `src/data/portfolio.ts` | All content: projects, skills, experience, certifications |
| `src/lib/stations.ts` | Camera position for each section |
| `src/components/Portfolio.tsx` | Page sections, gallery, scroll driver |
| `src/components/scene/` | The 3D room: shell, furniture, laptop, lighting |
| `public/images/projects/` | Project images (2000 px WebP) |
| `public/models/`, `public/textures/`, `public/hdri/` | Optimized Poly Haven assets |

To refresh the 3D assets, run `node scripts/fetch-assets.mjs`, then re-optimize the models with
`npx @gltf-transform/cli optimize <in>.gltf public/models/<name>.glb --texture-compress webp --texture-size 1024 --compress meshopt`.

## Credits

3D models, textures and the `sunset_jhbcentral` HDRI are from Poly Haven and released under
[CC0](https://polyhaven.com/license).
