# Oriel TV website

The public website for Oriel TV: <https://oriel-tv.vercel.app>.

It's a Next.js app (App Router, React, TypeScript) styled with Tailwind CSS, with Motion, Radix UI primitives, and lucide icons. Every page is rendered at build time and exported as static files to `out/` (ADR 0002). Colors, materials, type, and motion come from the shared design tokens (ADR 0003 and ADR 0005).

## Develop

```bash
npm ci
npm run dev
```

The repository's own documents (`CHANGELOG.md`, `SECURITY.md`, the guides in `docs/guides/`, and others) are read from the repository root at build time, so work from a full clone.

## Check before a pull request

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run check:routes
```

`npm test` runs the demo's focus and state logic and the Markdown parser with Node's built-in test runner. `check:routes` verifies that the static export contains every required route (PRD section 5.2) and that no internal link is broken.

## Deploy

The site is deployed on Vercel from the repository. Project settings:

- **Root Directory:** `website`
- **Framework preset:** Next.js (the static export is detected automatically)
- **Include files outside the root directory in the Build Step:** on, because pages read documents from the repository root.

Security headers for the deployment are in `vercel.json`. The `out/` folder can also be served by any static host.

Set `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_REPO_URL` to point a fork or preview at different addresses.
