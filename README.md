# V3L Code website

Marketing site for V3L Code. Next.js (App Router) · TypeScript (strict) · Tailwind CSS 4 · GSAP + ScrollTrigger · Lenis.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

Note: if `NODE_ENV=production` is set in your shell, use `npm install --include=dev`.

## Checks (also run in CI on every PR)

```bash
npm run lint
npm run format:check   # `npm run format` to fix
npm run typecheck
npm run build
```

## Environment

| Variable                                                                  | Purpose                                                                           | Default               |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------- |
| `NEXT_PUBLIC_SITE_URL`                                                    | Canonical origin for metadata, sitemap, robots, JSON-LD                           | `https://v3lcode.com` |
| `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GSC_VERIFICATION`, `NEXT_PUBLIC_PHONE` | Optional analytics, Search Console and click-to-call. See `docs/seo-analytics.md` | unset                 |

## Structure

- `src/app` routes: `/`, `/about`, `/services`, `/pricing`, `/contact`, plus `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, `icon.svg`.
- `src/lib/site.ts` single source of truth for name, URL, description, nav. Add new routes to `nav` so the sitemap picks them up.
- `src/lib/metadata.ts` `pageMetadata(title, description, path)` sets title, description, canonical and Open Graph per page.
- `src/components/motion-provider.tsx` registers GSAP/ScrollTrigger, runs Lenis from the GSAP ticker, disabled under `prefers-reduced-motion`.
- `src/components/scroll-reveal-demo.tsx` reference animation.

## Animation conventions

- Client components only; use `useGSAP` from `@gsap/react` with a `scope` ref so everything is cleaned up on unmount.
- Wrap motion in `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)`.
- Never touch `window`/`document` during render; keep GSAP out of server components.

## SEO conventions

Every page exports `metadata` via `pageMetadata` (unique title/description, canonical). One `<h1>` per page. JSON-LD Organization lives in the root layout.
