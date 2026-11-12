# Sunrise's website

This site runs at **https://playsunrise.net** on the umceko cluster, in namespace `sunrise`. Sunrise is a community fork of
[Horizon](https://github.com/horizon-rust/horizon) (upstream site: https://playhorizon.dev). The game, the launcher and their developer docs are in
[sunrise-org/horizon](https://github.com/sunrise-org/horizon), branch `release/sunrise`; this repository is only the site.

The site is a Next.js 16 app (App Router with Cache Components, React 19, Tailwind CSS 4), designed and developed by
Anthony S of [DezerX](https://dezerx.com) for Horizon, and carried on here.

## Working on it

You need Node 22 or newer.

```sh
git clone https://github.com/sunrise-org/horizon-site && cd horizon-site
npm ci
npm run dev                      # http://localhost:3000
npm run build && npm start       # the production build
npm run lint
```

- Changes land through pull requests to `main`. The `perf` workflow runs the unit tests, type checking, lint, production build and a real S3 upload test. Cluster deployment uses `Dockerfile` and `deploy/`; see [docs/perf.md](docs/perf.md).

## Performance captures

The site includes the `/perf` viewer, capture sharing and upload API. See [docs/perf.md](docs/perf.md) for its build, reader bundle and deployment in the umceko cluster's `sunrise` namespace.

## Layout

```
app/                    the routes: /, /hub, /mods, /mods/<id>, /mods/submit, /mods/mine, /mods/policy, /releases,
                        /stats, /docs, /docs/<page>, /privacy, /apply, /api-gaps, and the staff's
                        pages inside the hub: /hub/team, /hub/mod, /hub/sign-in, /hub/setup, /hub/staff-help
                        (the old /staff/* addresses redirect there; /hub/mod has a Cases tab: Kira's numbered mod
                        cases and appeals), and /hub/appeal: the appeal form for people banned from the Discord
                        server or the official Minecraft server (the link Kira DMs, or Discord sign-in; Kira's
                        appeal/* routes behind the same proxy; timeouts and quarantines are appealed on Discord)
app/api/                the registry and players proxies, release view counts, and an account's registry
                        submissions (/api/mod-submissions, read from sunrise-org/horizon-mods' pull requests for /mods/mine)
app/staff/api/          the staff dashboards' proxy to Kira's service
app/data/               /data/roadmap.json and /data/journal.json, which Kira reads
app/sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx, llms.txt/, og/docs/
                        search and sharing: sitemap, robots, share cards, the summary for AI search
components/             every section, page part and data loader
components/site.ts      the canonical address (SITE_URL), titles, descriptions and pageMetadata()
content/docs/           the player docs (*.md) and their navigation (nav.json)
vendor/horizon-site/    the previous site's hub code, pointed at Sunrise's repository; it builds /data/journal.json
public/                 images and icons
Dockerfile, railway.json   the Railway service
```

The `/docs/api/*` pages come from `docs/api/` in the game's repository, read from GitHub.

## Where the data comes from

- **GitHub's API**: releases, contributors, the roadmap's issues and pull requests. Cached for about 15 minutes.
  `GITHUB_TOKEN` lifts the rate limit.
- **Contributor credits**: the homepage counts commits in `arismoko/horizon`, including inherited Horizon history,
  and links to that fork's contributor graph. Website-maker PR counts stay on `sunrise-org/horizon-site`.
  Both use the `hours` cache profile: after an hour, the next visit triggers a background refresh.
- **Fresh within a minute**: every GitHub loader carries a cache tag (`components/github-fresh.ts`: the game's branch,
  its issues and pull requests, its releases, horizon-mods' main). Kira gets GitHub's organization webhook and calls
  `POST /api/revalidate` (`Authorization: Bearer $REVALIDATE_SECRET`, body `{"tags": [...]}`) for what changed; the
  tagged data expires at once and Kira loads the main pages again. Files of a branch are read at its current
  commit (`rawGameUrl`), because raw.githubusercontent.com keeps a branch's files for five minutes. Without the call,
  each loader's own `cacheLife` applies, as before.
- **Through Kira**: `components/github-api.ts` sends the REST reads to `GITHUB_PROXY_URL` (Kira's allowlisted proxy),
  so revalidating on every change doesn't run into the 60 requests an hour this host gets without a token.
- **The game's branch**: `GAME_REPO` (`sunrise-org/horizon`) at `GAME_REF` (`release/sunrise`), both in
  `components/game-repo.ts` and overridable by the environment: `README.md` (parity numbers), `roadmap/roadmap.json` (the hub),
  `docs/api/*.md`, `docs/telemetry.md` and `LICENSE`. A file missing on that branch shows the page's fallback, never a build error.
- **The mod registry**: the index at sunrise-org.github.io/horizon-mods, ratings and submissions through
  `REGISTRY_UPSTREAM`.
- **The official server's market**: `/hub/market` reads Kira's `/smp/market.json` (the page the SMP mod writes on the server, read by Kira once a minute) through `/api/market`.
- **Telemetry**: the Players page reads `telemetry.playsunrise.net` (or `TELEMETRY_URL`) through this site's server.

## Kira's feeds

`/data/roadmap.json` is the game repository's `roadmap/roadmap.json` as it is. `/data/journal.json` is built by
`journalJson()` in `vendor/horizon-site/hub.js`, the previous site's code, from the same GitHub requests the previous
build made. Kira posts each entry id once, so the ids must not change: leave `vendor/` and
`components/journal-feed.ts` alone unless Kira is changed with them. When GitHub does not answer, both feeds answer
503 instead of a partial feed.

## Environment

Railway service variables:

| Variable | What it does |
| --- | --- |
| `GITHUB_TOKEN` | Lifts GitHub's rate limit at build and at run time |
| `REVALIDATE_SECRET` | The bearer token Kira sends to `POST /api/revalidate` (1Password `Site revalidate secret`; the same value is Kira's `KIRA_SITE_REVALIDATE_SECRET`). Without it the route answers 404 |
| `GITHUB_PROXY_URL` | `https://mcp.playsunrise.net/github/proxy`: GitHub's REST API read through Kira (its GitHub App and ETag cache, with `REVALIDATE_SECRET` as the bearer), since this service has no GitHub token; when Kira doesn't answer, reads go to api.github.com directly |
| `REGISTRY_UPSTREAM` | The registry's submission service; `/api/mods/*` is proxied to it |
| `STAFF_UPSTREAM`, `STAFF_PROXY_KEY` | Kira's staff service and the key both sides hold; `/staff/api/*` is proxied to it |
| `RELEASE_VIEWS_SALT` | Salt for the hashed release views. Without it the server keeps one in `.data/` |
| `TELEMETRY_URL` | Optional, defaults to `https://telemetry.playsunrise.net` |
| `KIRA_URL` | Optional, Kira's address for `/api/market`; defaults to `https://kira-production-500e.up.railway.app` |
| `SITE_URL` | Optional, defaults to `https://playsunrise.net`; used for canonical links, the sitemap and share cards |
| `GAME_REPO`, `GAME_REF` | Optional, default `sunrise-org/horizon` and `release/sunrise`: the game's repository and branch the site reads (for development) |

Release view counts live in `.data/`, which is reset by every deploy unless a volume is mounted at `/app/.data`.

## Rules the site keeps

- The disclaimer, "Not an official Minecraft product. Not approved by or associated with
  Mojang or Microsoft.", is under the headline, in the phone menu, the footer and the 404 page.
- No Minecraft logo or wordmark; "Minecraft" appears only descriptively ("for Minecraft:
  Java Edition 26.3"). No game files are offered or linked.
- Parity is worded as what the harnesses compare, never as a percentage or a "100% parity" claim (decided
  2026-11-09); the parity section's numbers are where the project started.
- No cookies, analytics, trackers or third-party fonts and scripts.
- Motion stops under `prefers-reduced-motion`; nothing hijacks the scroll.

## Discord

The invite is one constant, `DISCORD_URL` in `components/links.ts`. While it is empty, every Discord link and button is hidden.

## Licences

Every asset is listed in [LEGAL.md](LEGAL.md).
