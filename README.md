# Budget Grocery List

A mobile-friendly web app for building grocery lists with **budget tracking**, **per-item notes**, **trip checkmarks** (picked up this run), **multi-list tabs**, **AI meal planning and recipe import** (Gemini), **voice add**, a **unit-price calculator**, and **price-sorted search links** for Amazon, Walmart, and Target.

## Features

- **Offline-ready PWA** — installable; precached shell + Google Fonts caching via Workbox.
- **Multiple lists** — create, switch, and rename lists; counts show how many items you still need from the store.
- **Honest insights** — live stats (need-from-store count, categories, priced lines, budget headroom) instead of fake “savings” numbers.
- **Share via URL** — list and budget restore from query parameters.
- **Optional secure Gemini usage** — use `VITE_GEMINI_API_KEY` locally, or deploy `api/gemini.js` on Vercel with `GEMINI_API_KEY` and set `VITE_GEMINI_PROXY_URL=/api/gemini` so the key stays server-side.

## Development

```bash
npm install
npm run dev
```

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_GEMINI_API_KEY` | Local / build | Call Gemini from the browser (key is still in the client bundle). |
| `VITE_GEMINI_PROXY_URL` | Production | e.g. `/api/gemini` — POST body forwarded to Gemini using server `GEMINI_API_KEY`. |
| `GEMINI_API_KEY` | Vercel (server) | Used only by `api/gemini.js`. |

Create a local `.env`:

```env
VITE_GEMINI_API_KEY=your_key_here
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build (includes PWA service worker) |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright E2E (starts dev server automatically) |
| `npm run test:e2e:ui` | Playwright UI mode |

## Deployment

### GitHub Pages

1. Repo **Settings → Pages**: set **Source** to **GitHub Actions** (not “Deploy from a branch”).
2. Push to `main` or `master`; the **Deploy to GitHub Pages** workflow builds with the correct `base` path (`/<repo-name>/`).
3. Site URL: `https://<owner>.github.io/budget-grocery-list/` (for this repo, owner is your GitHub user or org).

`VITE_GEMINI_API_KEY` and other secrets: add them under **Settings → Secrets and variables → Actions**, then wire them into the deploy workflow as `env` on the Build step if you want AI features on the hosted site (keys in the client bundle are only appropriate for personal/low-risk use).

### Other hosts

Static output is in `dist/` after `npm run build`. For **Vercel**, include `vercel.json` (SPA rewrite) and optionally `api/gemini.js` for the proxy. For a root URL (not `/<repo>/`), build with default `base` (local build or set `GITHUB_ACTIONS` unset).

## CI

GitHub Actions runs lint, build, and Playwright (Chromium) on pushes and pull requests to `main` / `master`.

## Docs

See `PRD.md` for the full product requirements and roadmap.
