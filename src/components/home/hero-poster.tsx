export const HERO_ART_LABEL =
  "code being typed turns into glass cubes that flow through a pipeline and assemble into a finished app.";

/** Static, procedural poster. Shown first and whenever the 3D scene is unavailable. */
export function HeroPoster() {
  return (
    <svg
      viewBox="0 0 640 400"
      role="img"
      aria-label={`Illustration: ${HERO_ART_LABEL}`}
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <g fill="none" strokeWidth="1.5">
        <rect
          x="32"
          y="48"
          width="190"
          height="150"
          rx="16"
          stroke="var(--border)"
          fill="var(--surface)"
        />
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="52"
            x2={52 + [120, 90, 130, 70, 100][i]}
            y1={78 + i * 24}
            y2={78 + i * 24}
            stroke="var(--text-muted)"
            strokeLinecap="round"
            strokeWidth="4"
          />
        ))}
        {[0, 1, 2].map((lane) => (
          <path
            key={lane}
            d={`M240 ${150 + lane * 50} C 300 ${150 + lane * 50}, 320 ${175 + lane * 20}, 380 ${175 + lane * 20}`}
            stroke="var(--accent)"
            strokeOpacity="0.7"
          />
        ))}
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={262 + i * 30}
            y={120 + i * 40}
            width="22"
            height="22"
            rx="4"
            stroke="var(--accent-2)"
            fill="var(--accent-2)"
            fillOpacity="0.25"
          />
        ))}
        <rect
          x="390"
          y="110"
          width="220"
          height="200"
          rx="16"
          stroke="var(--border)"
          fill="var(--surface)"
        />
        <rect
          x="404"
          y="124"
          width="44"
          height="172"
          rx="8"
          stroke="var(--accent-2)"
          fill="var(--accent-2)"
          fillOpacity="0.2"
        />
        <rect
          x="458"
          y="124"
          width="138"
          height="26"
          rx="8"
          stroke="var(--accent)"
          strokeOpacity="0.7"
        />
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={458 + i * 48}
            y="160"
            width="42"
            height="40"
            rx="8"
            stroke="var(--accent-2)"
            fill="var(--accent-2)"
            fillOpacity="0.25"
          />
        ))}
        {[40, 70, 55, 90, 65].map((h, i) => (
          <rect
            key={i}
            x={460 + i * 28}
            y={290 - h}
            width="18"
            height={h}
            rx="4"
            stroke="var(--accent)"
            strokeOpacity="0.8"
            fill="var(--accent)"
            fillOpacity="0.15"
          />
        ))}
      </g>
    </svg>
  );
}
