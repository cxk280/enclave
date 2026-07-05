# Deploying Enclave to Vultr

Enclave ships as a **self-contained container** (Next.js standalone output). It needs
**no external network at runtime** — fonts are vendored, inference is in-process, and a
strict CSP blocks egress — which keeps the deploy consistent with the sovereignty story.

> The showcase's GPU inference is a deterministic **mock**; this app runs fine on a small
> Cloud Compute instance. The "in-region GPU" is the production story the demo *describes*,
> not a runtime dependency of this container.

## Image

```bash
docker build -t enclave:latest .
docker run --rm -p 3000:3000 enclave:latest
# → http://localhost:3000 ; liveness at /api/health
```

The image is multi-stage (`node:22-alpine`), runs as non-root, exposes `:3000`, and has a
Docker `HEALTHCHECK` hitting `/api/health`.

## Choose a Vultr target (pick one)

**A. Cloud Compute + Docker (simplest, cheapest — recommended for the demo).**
1. Provision a small **Cloud Compute** instance **in the sovereign region** (e.g.
   Johannesburg, `af-south`). Region choice is the whole point — deploy in-country.
2. Install Docker, copy the repo (or pull the image from a registry), and run:
   ```bash
   docker run -d --restart unless-stopped -p 80:3000 --name enclave enclave:latest
   ```
3. Point DNS / a floating IP at the instance. Terminate when the demo is done to save cost.

**B. Vultr Kubernetes Engine (VKE) + Container Registry (for a longer-lived demo).**
1. Push the image to **Vultr Container Registry**:
   ```bash
   docker tag enclave:latest <registry-host>/enclave:latest
   docker push <registry-host>/enclave:latest
   ```
2. Create a **VKE cluster in the sovereign region**, add a Deployment (readiness/liveness
   probe → `GET /api/health`, containerPort `3000`) + a LoadBalancer Service.

**C. Vultr object storage** is **not** needed for this container (audit log is in-memory).
   It becomes relevant only when implementing the production "target architecture" (a
   region-locked, WORM/append-only audit store — see `README.md`).

## Runtime config

| Var | Default | Notes |
|---|---|---|
| `PORT` | `3000` | server port |
| `HOSTNAME` | `0.0.0.0` | bind address (set in the image) |
| `NODE_ENV` | `production` | set in the image |
| `NEXT_TELEMETRY_DISABLED` | `1` | set in the image — no telemetry egress |

No secrets, API keys, or external endpoints are required.

## Post-deploy smoke check
```bash
scripts/smoke.sh https://<host>   # health, all routes, CSP, egress:none / 0 external calls
```
Or manually:
```bash
curl -fsS https://<host>/api/health         # {"status":"ok","region":"af-south-1"}
curl -sI https://<host>/ | grep -i content-security-policy   # connect-src 'self' present
```
Then click the demo: Landing → Enter the demo → Analyze → residency panel; flip the region
toggle; open the Audit trail and Export.

## Sovereign-region caveats
- Deploy the instance/cluster **in the target country's Vultr region** — that placement is
  the guarantee the UI asserts.
- Production Vultr **Sovereign Cloud** (air-gapped + nationals-only detached control plane)
  is an enterprise/contact-sales product; this container reproduces the *residency + audit
  UX* at self-serve prices in a standard in-region location.
- Merge the QA PR (mobile/a11y/blocker fixes) before building the deploy image so the shipped
  build includes them.
