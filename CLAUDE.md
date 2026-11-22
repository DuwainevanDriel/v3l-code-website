# CLAUDE.md

See README.md for commands and structure. Rules:

- TypeScript strict, no `any`, no `console.log`, no commented-out code.
- Next.js here is a recent version: check `node_modules/next/dist/docs/` before using APIs from memory.
- Do not use `new Date()` or other unstable values in server components (breaks prerender).
- GSAP only in `"use client"` components via `useGSAP` + `gsap.matchMedia()` for reduced motion.
- Each page: `export const metadata = pageMetadata(...)`; new routes get added to `siteConfig.nav`.
- Before a PR: `npm run lint && npm run format:check && npm run typecheck && npm run build`.
- Branch `<ISSUE-ID>-slug`, never push to `main`, never merge.
