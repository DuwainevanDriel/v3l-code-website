const stack = [
  "TypeScript",
  "React",
  "Next.js",
  "React Native",
  ".NET",
  "AWS",
  "PostgreSQL",
  "Vercel",
];

function Row({ clone = false }: { clone?: boolean }) {
  return (
    <ul
      aria-hidden={clone ? "true" : undefined}
      className={`flex shrink-0 gap-12 pr-12 ${clone ? "marquee-clone" : ""}`}
    >
      {stack.map((name) => (
        <li
          key={name}
          className="font-display text-muted text-2xl font-semibold whitespace-nowrap"
        >
          {name}
        </li>
      ))}
    </ul>
  );
}

/** CSS-only loop (transform), paused on hover/focus; becomes a static wrapped list under reduced motion. */
export function Marquee() {
  return (
    <section
      aria-label="Technologies we work with"
      className="marquee border-border overflow-hidden border-y py-8"
    >
      <div className="marquee-track flex">
        <Row />
        <Row clone />
      </div>
    </section>
  );
}
