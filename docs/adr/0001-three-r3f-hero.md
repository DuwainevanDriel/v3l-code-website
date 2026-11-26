# ADR 0001: three.js and @react-three/fiber for the home hero

Status: proposed (CTO to approve) · Issue: VLC-20 (parent VLC-18) · Spec: `docs/design/VLC-19-3d-hero-story/spec.md`

## Context

The home hero gets an interactive 3D story: typed code becomes glass cubes, the cubes ride glowing pipes and unfold into a product UI. The page is statically prerendered, GSAP and Lenis already drive motion, and LCP must not regress. No paid service may be used.

## Decision

Add two runtime dependencies and one type package, loaded only through `next/dynamic({ ssr: false })` in a lazy chunk:

| Package              | Why                                                                                       | Licence |
| -------------------- | ----------------------------------------------------------------------------------------- | ------- |
| `three`              | WebGL renderer, geometry and materials. Named imports only so unused code is tree-shaken. | MIT     |
| `@react-three/fiber` | Declarative renderer lifecycle in React: canvas, resize, frame loop, disposal on unmount. | MIT     |
| `@types/three` (dev) | Types for `three`.                                                                        | MIT     |

`@react-three/drei` is **not** added. Nothing in this scene needs its helpers, and it would add weight to the chunk. It can be added later if a feature needs it.

All geometry is generated in code. There are no models, textures, HDRIs or fonts, so there is no asset licensing question. Colours are read from the existing CSS variables (`--accent`, `--accent-2`), so the theme is unchanged.

## Consequences

- Measured lazy chunk: about 245 KB gzipped (`three` dominates). Budget in the spec is 300 KB. It is **not** in the initial bundle for `/`, and it is requested only when the browser is idle and the hero canvas is at least 25% visible.
- Visitors on reduced motion, Save-Data, paused motion (footer toggle), no WebGL2, or low-memory touch devices get a static SVG poster and never download the chunk. Load failure, a 4 s timeout, WebGL context loss and a low frame rate all fall back to the poster silently.
- `three` releases frequently. Versions are pinned exactly in `package.json` and upgraded deliberately.

## Alternatives considered

- **Vanilla `three` without R3F** (suggested in the spec): about 25 KB gz smaller, but needs hand-written lifecycle and resize code. R3F was requested in the task and the budget still holds.
- **CSS/SVG/Lottie animation**: cheapest, but not interactive in 3D and no real depth or parallax.
- **Video loop**: heavy for LCP and bandwidth, not interactive.

## Rollback

Remove `<HeroScene />` from `src/components/home/hero.tsx`. The poster, the lazy chunk and the dependencies become unused and can be deleted in a follow-up.
