const stack = [
  "TypeScript",
  "React",
  "Next.js",
  "React Native",
  "Hosting",
  ".NET",
  "AWS",
  "PostgreSQL",
  "Vercel",
  "Domain",
  "Python",
  "Azure",
  "SQL",
  "NeonDB",
  "Docker",
  "Tailwind",
];

/** Copies of the list in the track. Enough that one copy plus the rest covers any screen width. */
const COPIES = 6;

function Row({ clone = false }: { clone?: boolean }) {
  return (
    <ul
      aria-hidden={clone ? "true" : undefined}
      className={`flex shrink-0 gap-20 pr-20 ${clone ? "marquee-clone" : ""}`}
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
        {Array.from({ length: COPIES }, (_, i) => (
          <Row key={i} clone={i > 0} />
        ))}
      </div>
    </section>
  );
}
