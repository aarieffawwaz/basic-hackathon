# Deploy

Static output, no environment variables.

## Cloudflare Pages (what the live site uses)
Live at https://shiftreplay.pages.dev. The Pages project is connected to this GitHub repo:
every push to `main` builds and deploys production; other branches get a preview URL.

Build command `pnpm build`, output directory `dist`. Both pages are emitted (`/` and `/play/`).

Manual deploy, if ever needed:
```bash
pnpm build
npx wrangler pages deploy dist --project-name shiftreplay --branch main
```

## Any static host
```bash
pnpm build
# upload dist/ — Netlify, Vercel, GitHub Pages, S3
```
`/play/` is a folder with its own `index.html`, so no rewrite rules are needed.
