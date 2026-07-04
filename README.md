# Enclave — Sovereign Clinical AI

**Enclave** runs clinical LLM and medical-imaging inference *inside a country's borders*, on
air-gapped infrastructure whose control plane is detached from the global cloud and operated only by
nationals of the host country. Protected health information (PHI) is provably never able to leave the
jurisdiction. It targets regulated health systems that are legally barred from using US-hyperscaler
AI and today have **no compliant local alternative**.

**Vultr capability this proves:** Vultr **Sovereign Cloud** (air-gapped deployment + nationals-only,
fully-detached control plane) combined with **in-region Cloud GPU** — a data-sovereignty guarantee
no hyperscaler can currently offer.

## Cost estimate (tight budget)

Designed to run on **hourly billing, torn down when idle** — you only pay while building or demoing.

| Item | Rate | Notes |
|---|---|---|
| Inference GPU (NVIDIA L40S-class) | ~$0.90–1.20/hr | Small clinical LLM + imaging classifier; runs only during dev/demo. A single A16 (~$0.47/hr) with a quantized model is a cheaper fallback. |
| App / API host (Cloud Compute) | ~$0.01/hr (~$5–10/mo) | Lightweight; can stay up |
| Object Storage (Archival tier) | ~$6/mo | Encrypted PHI + audit logs (or use block storage) |
| **~4-hour demo session** | **≈ $5–8 total** | GPU hours are the only meaningful cost |

Leaving an L40S on 24/7 would be ~$650+/mo, so **destroy the GPU instance when not in use.** Vultr's
production Sovereign Cloud is an enterprise/contact-sales product; this showcase reproduces the
guarantee with a standard **in-region** GPU plus the residency/audit UX at self-serve prices.

See [`PLAN.md`](./PLAN.md) for the full concept and build plan, and [`VIEWS.md`](./VIEWS.md)
for the view-by-view UX spec the UI is built from.

## Running the showcase

Built with **Next.js (App Router) + TypeScript + Tailwind**. Inference is a **deterministic
mock** — the server returns a synthetic clinical case stamped with the serving region and a
cryptographic audit hash, making **zero external calls** by construction (that is the
sovereignty guarantee, not an implementation detail).

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # vitest (unit + sovereignty property checks)
npm run e2e        # playwright (demo flow + audit trail)
```

### The demo flow

1. **Landing** (`/`) — the concept + an Enclave-vs-hyperscaler contrast. Click **Enter the demo**.
2. **Workspace** (`/workspace`) — load the sample case and **Analyze in-region**.
3. **Result** (`/workspace/result`) — clinical output on the left; the **residency panel**
   (the money shot) on the right: *Processed in Johannesburg · Data never left South Africa ·
   Egress: none*, plus a `0 external API calls` counter and an audit stamp.
4. **Audit Trail** (`/audit`) — every PHI access attributed to an in-country operator.
5. **Settings** (`/settings`) — flip the **region toggle**; the residency bar re-pins live.

Toggle light/dark from the residency bar. All PHI in the showcase is **synthetic and
de-identified**.
