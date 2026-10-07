export type Vec3 = [number, number, number];

/** Page sections, in scroll order. Each one owns a camera station of the same index. */
export const sections = [
  { id: "intro", label: "Intro" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "certifications", label: "Credentials" },
  { id: "contact", label: "Contact" },
] as const;

/**
 * Camera framing per section, in meters inside the room:
 * floor at y = 0, back (brick) wall at z = -3, frame wall at x = -4, window at x 1.55–3.25.
 * Subjects are framed centered; the overlay shifts the render with a view offset
 * so they land beside the reading column.
 */
export const stations: { pos: Vec3; target: Vec3 }[] = [
  { pos: [-2.7, 1.6, 2.5], target: [1.3, 1.05, -2.4] }, // intro: the whole room at golden hour
  { pos: [0.35, 1.3, -0.65], target: [-0.25, 0.95, -2.65] }, // about: the desk
  { pos: [-1.55, 1.35, -0.85], target: [-2.4, 1.0, -2.8] }, // skills: the shelves
  { pos: [-0.36, 1.03, -1.85], target: [-0.38, 0.9, -2.5] }, // projects: laptop close-up
  { pos: [0.55, 1.35, 0.45], target: [2.5, 1.0, -2.0] }, // experience: reading corner by the window
  { pos: [-0.1, 1.55, -0.7], target: [-4, 1.5, -1.05] }, // credentials: the frame wall
  { pos: [-1.2, 1.5, 1.8], target: [2.3, 1.45, -3] }, // contact: out the window
];
