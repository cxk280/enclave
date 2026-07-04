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

See [`PLAN.md`](./PLAN.md) for the full concept and build plan.
