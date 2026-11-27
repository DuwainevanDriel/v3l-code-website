export const HERO_ART_LABEL =
  "a circuit chip is planned, code is typed and turns into cubes that stack into a tested build, then ships through glowing pipes to a live server.";

const SCALE = 56;
const CX = 280;
const CY = 260;
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

/** Isometric projection of a world point (x right, y up, z towards the viewer). */
function iso(x: number, y: number, z: number): string {
  const sx = CX + (x - z) * COS * SCALE;
  const sy = CY + (x + z) * SIN * SCALE - y * SCALE;
  return `${sx.toFixed(1)},${sy.toFixed(1)}`;
}

function box(x: number, y: number, z: number, w: number, h: number, d: number) {
  const x1 = x + w;
  const y1 = y + h;
  const z1 = z + d;
  return {
    top: [iso(x, y1, z), iso(x1, y1, z), iso(x1, y1, z1), iso(x, y1, z1)].join(
      " ",
    ),
    left: [iso(x, y, z1), iso(x1, y, z1), iso(x1, y1, z1), iso(x, y1, z1)].join(
      " ",
    ),
    right: [
      iso(x1, y, z),
      iso(x1, y, z1),
      iso(x1, y1, z1),
      iso(x1, y1, z),
    ].join(" "),
  };
}

const CHIP = box(-1.65, 0, -1.65, 3.3, 0.3, 3.3);
const DIE = box(-1.35, 0.3, -1.35, 2.7, 0.02, 2.7);

const PITCH = 0.57;
const KINDS = [
  "gloss",
  "accent",
  "gloss",
  "glass",
  "gloss",
  "gloss",
  "accent",
  "glass",
  "gloss",
] as const;
/** Back to front, bottom to top, so nearer cubes paint over farther ones. */
const CUBES = [0, 1, 2].flatMap((layer) =>
  [-1, 0, 1].flatMap((z) =>
    [-1, 0, 1].map((x) => ({
      key: `${layer}${x}${z}`,
      kind: KINDS[(x + 1 + (z + 1) * 3 + layer * 2) % KINDS.length],
      faces: box(
        x * PITCH - 0.25,
        0.3 + layer * PITCH,
        z * PITCH - 0.25,
        0.5,
        0.5,
        0.5,
      ),
    })),
  ),
);

const PIPES = [
  [
    [1.75, 0.18, -0.6],
    [2.75, 0.95, -0.45],
    [3.25, 0.1, 0.08],
  ],
  [
    [1.75, 0.18, 0],
    [2.6, 0.2, 0.2],
    [3.18, 0.1, 0.35],
  ],
  [
    [1.75, 0.18, 0.6],
    [2.7, 0.5, 1.2],
    [3.27, 0.1, 0.63],
  ],
].map(
  ([a, b, c]) =>
    `M${iso(a[0], a[1], a[2])} Q${iso(b[0], b[1], b[2])} ${iso(c[0], c[1], c[2])}`,
);

const GEM_TOP = iso(3.75, 1.95, 0.35);
const GEM_MID_L = iso(3.45, 1.35, 0.65);
const GEM_MID_R = iso(4.05, 1.35, 0.05);
const GEM_MID_F = iso(4.05, 1.35, 0.65);
const GEM_BOTTOM = iso(3.75, 0.75, 0.35);
const [PAD_X, PAD_Y] = iso(3.75, 0, 0.35).split(",").map(Number);

const FILL = {
  gloss: ["#e4e7ef", "#b9bfcc", "#9aa1b2"],
  accent: ["#9a85ff", "var(--accent-2)", "#5a41c9"],
  glass: ["#c9cff5", "#8f97c7", "#6c74a6"],
} as const;

/** Static, procedural poster. Shown first and whenever the 3D scene is unavailable. */
export function HeroPoster() {
  return (
    <svg
      viewBox="0 0 640 480"
      role="img"
      aria-label={`Illustration: ${HERO_ART_LABEL}`}
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="hero-poster-glow">
          <stop offset="0" stopColor="var(--accent-2)" stopOpacity="0.45" />
          <stop offset="1" stopColor="var(--accent-2)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx={CX}
        cy={CY + 40}
        rx="260"
        ry="150"
        fill="url(#hero-poster-glow)"
      />
      <g strokeLinejoin="round">
        <polygon points={CHIP.left} fill="#9aa1b2" />
        <polygon points={CHIP.right} fill="#7d8496" />
        <polygon points={CHIP.top} fill="#b9bfcc" />
        <polygon points={DIE.top} fill="#2a2f5c" />
        {PIPES.map((d) => (
          <g key={d} fill="none" strokeLinecap="round">
            <path d={d} stroke="#c9ced9" strokeWidth="9" strokeOpacity="0.8" />
            <path d={d} stroke="var(--accent)" strokeWidth="2.5" />
          </g>
        ))}
        <ellipse
          cx={PAD_X}
          cy={PAD_Y}
          rx="38"
          ry="22"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.6"
        />
        <ellipse
          cx={PAD_X}
          cy={PAD_Y}
          rx="56"
          ry="32"
          fill="none"
          stroke="var(--accent)"
          strokeOpacity="0.35"
        />
        {CUBES.map((c) => (
          <g key={c.key} fillOpacity={c.kind === "glass" ? 0.75 : 1}>
            <polygon points={c.faces.left} fill={FILL[c.kind][1]} />
            <polygon points={c.faces.right} fill={FILL[c.kind][2]} />
            <polygon points={c.faces.top} fill={FILL[c.kind][0]} />
          </g>
        ))}
        <polygon
          points={`${GEM_TOP} ${GEM_MID_L} ${GEM_MID_F}`}
          fill="#f2f4fb"
        />
        <polygon
          points={`${GEM_TOP} ${GEM_MID_F} ${GEM_MID_R}`}
          fill="#c9cdd8"
        />
        <polygon
          points={`${GEM_BOTTOM} ${GEM_MID_L} ${GEM_MID_F}`}
          fill="var(--accent-2)"
        />
        <polygon
          points={`${GEM_BOTTOM} ${GEM_MID_F} ${GEM_MID_R}`}
          fill="#5a41c9"
        />
      </g>
    </svg>
  );
}
