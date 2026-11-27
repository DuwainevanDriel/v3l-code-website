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

**Update (VLC-21, hero polish):** the scene was rebuilt with real materials (physical glass and clearcoat, a studio environment map, bloom). Three more runtime dependencies were added for this, also only in the lazy chunk:

| Package                       | Why                                                                                    | Licence |
| ----------------------------- | -------------------------------------------------------------------------------------- | ------- |
| `@react-three/drei`           | `Grid` for the blueprint floor. Other helpers can be used later.                       | MIT     |
| `@react-three/postprocessing` | `EffectComposer`, `Bloom`, `Noise` and AgX `ToneMapping`.                              | MIT     |
| `postprocessing`              | Peer dependency of the above; imported directly for `BlendFunction`/`ToneMappingMode`. | Zlib    |

drei's `Environment` is deliberately **not** used: it bundles the HDR/EXR/gain-map loaders (about 25 KB gz) even when no file is loaded. `hero-3d/studio-env.tsx` builds the same studio lighting from a few glowing panels with `PMREMGenerator`.

All geometry is generated in code. There are no models, textures, HDRIs or fonts, so there is no asset licensing question. Colours are read from the existing CSS variables (`--bg`, `--accent`, `--accent-2`), so the theme is unchanged.

## Consequences

- Measured lazy chunk: about 297 KB gzipped after VLC-21 (was 245 KB; `three` dominates, postprocessing adds about 50 KB). Budget in the spec is 300 KB, so further 3D features need to remove weight first. It is **not** in the initial bundle for `/`, and it is requested only when the browser is idle and the hero canvas is at least 25% visible.
- Visitors on reduced motion, Save-Data, paused motion (footer toggle), no WebGL2, or low-memory touch devices get a static SVG poster and never download the chunk. Load failure, a 4 s timeout, WebGL context loss and a low frame rate all fall back to the poster silently.
- `three` releases frequently. Versions are pinned exactly in `package.json` and upgraded deliberately.

## Alternatives considered

- **Vanilla `three` without R3F** (suggested in the spec): about 25 KB gz smaller, but needs hand-written lifecycle and resize code. R3F was requested in the task and the budget still holds.
- **CSS/SVG/Lottie animation**: cheapest, but not interactive in 3D and no real depth or parallax.
- **Video loop**: heavy for LCP and bandwidth, not interactive.

## Rollback

Remove `<HeroScene />` from `src/components/home/hero.tsx`. The poster, the lazy chunk and the dependencies become unused and can be deleted in a follow-up.
