# Deploy

Static output, no environment variables.

## Vercel (what the live site uses)
```bash
pnpm dlx vercel link --yes --project shiftreplay
pnpm dlx vercel --prod --yes
```
Framework preset: Vite. Build `pnpm build`, output `dist/`. Both pages are emitted (`/` and `/play/`).

## Any static host
```bash
pnpm build
# upload dist/ — Netlify, Cloudflare Pages, GitHub Pages, S3
```
`/play/` is a folder with its own `index.html`, so no rewrite rules are needed.
