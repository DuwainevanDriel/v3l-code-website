# Deploy runbook: V3L Code website

Status: DRAFT. Vercel project, domain and DNS are not yet set up (see VLC-10).

## Architecture

- Next.js app on Vercel. Preview deployment per PR, production from `main`.
- CI (`.github/workflows/ci.yml`): lint, format, typecheck, build on every PR.
- Uptime (`.github/workflows/uptime.yml`): pings `vars.SITE_URL` every 15 min; failures email repo watchers. Enable by setting repo variable `SITE_URL`.

## One-time setup (needs the Vercel account owner)

1. Vercel > Add New Project > import `DuwainevanDriel/v3l-code-website`. Framework: Next.js, Node 22, defaults for build/output.
2. Production branch: `main`. Preview deployments: all other branches/PRs.
3. Set environment variables (names in `.env.example`) per scope. Never commit values.
4. Turn on Vercel Web Analytics (free Hobby tier). Sentry only after approval.

## Environment variables

| Name                                                      | Scope                                                            | Notes                           |
| --------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                    | Prod: canonical URL. Preview: leave unset or use the preview URL | Used for canonical, sitemap, OG |
| `EMAIL_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Prod + Preview                                                   | Contact form provider (TBC)     |

Preview deployments should be `noindex` (Vercel adds `X-Robots-Tag: noindex` on `*.vercel.app` previews automatically).

## Domain, DNS, SSL (production change: needs board approval)

1. Confirm domain name with owner (code default is `v3lcode.com`).
2. Vercel > Project > Domains: add apex `v3lcode.com` (primary) and `www.v3lcode.com` set to redirect (308) to apex.
3. DNS at the registrar/DNS provider: apex `A 76.76.21.21`, `www` `CNAME cname.vercel-dns.com` (use the values Vercel displays if they differ). Keep any MX/TXT mail records untouched.
4. SSL is issued automatically by Vercel after DNS resolves. Verify:
   - `curl -sI https://v3lcode.com` returns 200 with valid cert
   - `curl -sI http://v3lcode.com` and `https://www.v3lcode.com` return 308 to `https://v3lcode.com`
5. Set `SITE_URL` repo variable to the production URL to enable uptime checks.

## Promoting to production

1. PR reviewed by CTO, preview verified, Duwaine merges to `main`.
2. Production cutover (first launch, domain attach) needs explicit board approval with plan on the task.

## Rollback

- Vercel > Deployments > previous good deployment > Promote to Production (instant), or `git revert` on `main`.
- DNS rollback: restore previous records (record them before changing).

## Monitoring

- Uptime: GitHub Action above. Vercel Web Analytics for traffic. Sentry free tier when approved.
