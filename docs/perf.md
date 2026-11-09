# Performance captures

The viewer lives at https://playsunrise.net/perf. The site uses playsunrise.net; its TLS certificate covers the apex and *.playsunrise.net. perf.playsunrise.net redirects to the profiler, and other subdomains redirect to the apex. Pick a `.hzperf` file, paste or drop one, or open a shared capture link at `/perf/c/<id>`. Reading a local capture stays in the browser. **Share** shows what the capture may contain and asks before uploading; it creates a 30-day link and shows an owner-only delete token. The Compare tab accepts a second local file or a link from this site.

The UI moved from the game repository's `web/perf/`, including its pending UI fixes. `app/perf/` has its own root layout, `lib/perf/` owns the viewer helpers, and `messages/perf/en_us.json` contains its strings. The site's other root layouts continue to own their routes.

## Reader assets

The Rust reader remains in [sunrise-org/horizon](https://github.com/sunrise-org/horizon). The site checks in its WASM, matching JavaScript wrapper, fonts and icon, so normal builds require only Node 24. `vendor/perf/manifest.json` records the exact game revision and asset checksums. `vendor/perf/source.patch` preserves any reader changes that were not committed when the bundle was imported.

To reproduce or update a bundle, check out the recorded game revision, apply `source.patch` if nonempty, then run:

```sh
CARGO_TARGET_DIR=/projects/.cache/hz-targets/launch cargo xtask perf-wasm
cd /path/to/horizon-site
npm run perf:import -- /path/to/horizon /projects/.cache/hz-targets/launch/perf-wasm
npm test
npm run typecheck
npm run lint
npm run build
```

Import the reader and wrapper together. `npm run perf:check` verifies the bundle; it also runs before dev and production builds.

## Upload API

| Method | Path | Result |
| --- | --- | --- |
| POST | `/api/perf/captures` | Validate raw bytes, store them unchanged, return an id, temporary link and delete token |
| GET | `/api/perf/captures/<id>` | The original capture bytes with an immutable cache header |
| GET | `/api/perf/captures/<id>/meta` | Size, creation, expiry, share state and reader-derived summary |
| POST | `/api/perf/captures/<id>/share` | Pin for 30 days; needs `Authorization: Bearer <delete_token>` |
| DELETE | `/api/perf/captures/<id>` | Delete; needs the same owner token |
| POST | `/api/perf/sweep` | Remove expired or abandoned uploads; needs `PERF_SWEEP_TOKEN` |

`npm run test:api` exercises the built standalone server against a real S3 endpoint configured through the variables below. CI provides a RustFS service and runs it after building, catching worker bundling and storage integration failures.

All JSON replies use `Cache-Control: no-store`. Raw downloads use `application/vnd.horizon.perf` and `nosniff`. Invalid captures return 415, newer formats 422, oversized bodies 413, wrong tokens 403, full storage 507 and rate-limited uploads 429. The same bundled WASM validates uploads in a worker with a timeout and bounded inflation; at most two validations run concurrently.

S3 stores the original bytes. SQLite stores metadata, hashed delete tokens, byte reservations and hashed-IP upload attempts, with transactions protecting limits and share state. SQLite and S3 both need persistent volumes. Temporary captures expire after one hour; sharing pins them for 30 days from the first share. Repeated shares do not extend retention. A five-minute CronJob sweeps expired bytes; expired links stop working even before the sweep runs. New uploads cannot cross 90% of the configured capacity. Shared captures are never evicted early. The default is 20 upload attempts per IP per hour, retained across restarts.

## Configuration and deployment

`deploy/` contains the umceko cluster resources for namespace `sunrise`: a single site replica with persistent metadata, a dedicated RustFS instance with a 1 GiB `local-path` volume, and the retention CronJob. Keep one site replica while SQLite is used. The public hostname is supplied by the `site-domain` ConfigMap's `SITE_URL`; it is also passed to the image build as `--build-arg SITE_URL=https://your-host` for canonical links.

The cluster's cert-manager controller must include the [1.16.4 Cloudflare API compatibility fix](https://cert-manager.io/docs/releases/release-notes/release-notes-1.16/) or a later release. During this deployment the controller was patched from 1.16.2 to 1.16.4; its webhook and CA injector were left unchanged. Without that fix, DNS challenges validate but cannot clean up, which blocks the next challenge and renewals.

Apply `deploy/domain.yaml` for the domain, namespace-local DNS issuer, wildcard certificate and gateway routes. The `sunrise-dns` Secret holds a Cloudflare token scoped to DNS editing and zone reading for playsunrise.net.

The `perf-storage` Kubernetes Secret holds `PERF_S3_ACCESS_KEY`, `PERF_S3_SECRET_KEY` and `PERF_SWEEP_TOKEN`. Generate independent random values; never commit them. The deployment reads them directly, and the RustFS console is disabled.

| Variable | Default or requirement |
| --- | --- |
| `PERF_PUBLIC_URL` | Required public origin; falls back to `SITE_URL` |
| `PERF_S3_ENDPOINT`, `PERF_S3_BUCKET` | Required S3 endpoint and bucket |
| `PERF_S3_ACCESS_KEY`, `PERF_S3_SECRET_KEY` | Required credentials for the dedicated store |
| `PERF_S3_REGION` | `us-east-1` |
| `PERF_DATABASE` | `.data/perf.sqlite` |
| `PERF_MAX_BYTES` | `67108864` (64 MiB) |
| `PERF_STORAGE_BYTES` | `1073741824` (1 GiB logical capture capacity) |
| `PERF_SHARED_DAYS` | `30` |
| `PERF_HOURLY_UPLOADS` | `20` |
| `PERF_TRUST_PROXY` | `false`; enable only behind the cluster gateway, which computes `X-Envoy-External-Address` using trusted Cloudflare proxy ranges |
| `PERF_SWEEP_TOKEN` | Required by the sweep endpoint and CronJob |

The gateway trusts only Cloudflare's [published IPv4](https://www.cloudflare.com/ips-v4) and [IPv6](https://www.cloudflare.com/ips-v6) proxy ranges when extracting client addresses. Refresh `ClientTrafficPolicy` when those ranges change.

The `local-path` provisioner does not enforce a physical filesystem quota. The API's persistent byte reservations enforce the logical capture capacity, retaining 10% for storage metadata. The metadata PVC is 256 MiB. Include both volumes in backups and restore them together.

The game tool supports `horizon-perf upload FILE`, `horizon-perf share FILE`, and share links in summary, query and diff. `PERF_UPLOAD_URL` overrides its upload endpoint.
