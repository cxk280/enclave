# Enclave — Interview Demo Guide

Everything you need to (1) run and understand the demo locally, (2) present it for maximum
impact, and (3) deploy it to Vultr in the sovereign region **for cents**, with nothing left
running when you're not using it.

The pitch in one line: **"Clinical AI that never leaves the country."** Enclave shows a
hospital uploading a chest X-ray, getting an AI read back, and being able to *prove* to a
regulator that the patient's data never left the sovereign region.

> Honest framing you should say out loud: **the GPU inference is a deterministic mock**, but
> the **sovereignty engineering is real** — no external network calls, a strict egress-blocking
> CSP, vendored fonts, and a tamper-evident hash-chained audit log. The demo proves the
> *residency + audit UX*; production maps to Vultr Sovereign Cloud + in-region GPU.

---

## Part 1 — Run it locally

You have two ways to run it. For **understanding and rehearsing**, use the production server —
it's byte-for-byte what Vultr will serve.

### Production server (recommended for rehearsal)
```bash
cd /Users/christopherking/code/vultr/enclave
npm run build      # ~30s; compiles the standalone app
npm run start      # serves http://localhost:3000
```
Open **http://localhost:3000**. Stop it with `Ctrl-C` (or the helper below).

### Dev server (only if you're editing code)
```bash
npm run dev        # http://localhost:3000, hot reload
```

### Health / stop helpers
```bash
curl -fsS http://localhost:3000/api/health      # {"status":"ok","region":"af-south-1"}
lsof -ti:3000 | xargs kill                       # stop whatever is on :3000
```

---

## Part 2 — Understand what you're showing (the 5 screens)

| Screen | Route | What it proves |
|---|---|---|
| **Landing** | `/` | The hook + the guarantee ("never leaves the country"). |
| **Workspace** | `/workspace` | Load the sample chest X-ray, click **Analyze in-region**. |
| **Result** | `/workspace/result` | The money shot: clinical read + **residency panel** ("Processed in Johannesburg · Egress: none · 0 external calls"). |
| **Audit trail** | `/audit` | Regulator-facing evidence: every PHI access, attributed, hash-chained, exportable + self-verifiable. |
| **Settings** | `/settings` | Flip the sovereign region (Johannesburg ⇄ Cape Town ⇄ Nairobi). The whole app re-pins. |

**Why each piece exists (so you can answer "how does it work?"):**
- **Egress: none is enforced, not asserted.** A Content-Security-Policy header with
  `connect-src 'self'` is served on every response — the browser will *block* any call to an
  outside host. Fonts are vendored (no Google Fonts CDN), inference runs in-process, and
  Next.js telemetry is disabled. There is nothing for the app to phone home to.
- **The audit log is a real hash chain.** Each entry's hash includes the previous entry's hash
  (SHA-256, genesis → tip). Change any row and every later hash breaks — that's what makes the
  export *self-verifiable* by a regulator. The result page stamps its `sha256:` hash, and that
  exact hash appears as a row in the trail.
- **The region toggle is the whole thesis.** Sovereignty is a *placement* decision; the toggle
  makes that a first-class control instead of buried infrastructure.
- **Cold-visit safety.** Opening `/workspace/result` directly (no analysis run) shows "No
  analysis yet" and logs nothing — the audit trail only ever records *deliberate* analyses.

---

## Part 3 — The interview demo script (~5–7 minutes)

Audience = Vultr. They care about **why the sovereign-cloud footprint is the differentiator**.
Lead with the problem, land the proof, close on the architecture.

**0. Set the stage (15s).**
> "Hard data-localization laws — South Africa's POPIA, and similar across Africa and the
> Middle East — say patient data can't leave the country. Most clinical AI is a US hyperscaler
> API, which breaks that on the first call. Enclave is clinical AI that runs *in-region* on
> Vultr, and proves it."

**1. Landing → the guarantee (30s).** Read the hero line. Scroll to the guarantee section.

**2. Run an analysis — the money shot (90s).**
Workspace → **Load the sample case** → **Analyze in-region** → land on the result.
- Point at the clinical read: findings on the X-ray with confidence %, a coding suggestion.
- Then pivot to the **residency panel** — *this* is the point: "Processed in Johannesburg.
  Egress: none. 0 external API calls at inference." Say: *"The clinical output is table stakes.
  The proof that it never left the country is the product."*

**3. Prove it — don't just claim it (60s). ← the credibility kicker.**
Open browser DevTools → **Network** tab → reload → *"Only one host: our own. No CDN, no
analytics, no model API."* Then in the **Console**, run:
```js
fetch("https://example.com")   // blocked by connect-src 'self'
```
It's blocked by the CSP. *"Egress isn't a promise in a slide — the browser physically can't."*

**4. The regulator's view (60s).**
Open **/audit**. *"Every PHI access, attributed to an in-country operator."* Click a row's
hash → it deep-links to that exact entry. Hit **Export for regulator** → open the file →
*"Algorithm, genesis hash, chain rule, and a validity flag. A regulator can recompute this
chain themselves — it's tamper-evident, not our word for it."*

**5. Sovereignty as a control (30s).**
Settings → switch **Johannesburg → Cape Town** (or Nairobi). Top bar, workspace banner, and
audit region all re-pin. *"Residency is a toggle, not a re-architecture."*

**6. Close on the architecture (30s).**
> "What you saw is a self-contained container I deployed in Vultr's Johannesburg region — the
> residency and audit UX are real. In production this maps to Vultr Sovereign Cloud with an
> in-region GPU for the actual model. Same story, same region, real inference."

**If asked "is the AI real?"** — answer honestly and immediately: *"The inference is a
deterministic mock so the demo is reproducible; the sovereignty layer — egress control, CSP,
the audit chain — is all real code. Swapping the mock for an in-region GPU model is the
production step, and it doesn't change the residency guarantees."* Owning this *builds* trust.

**Have ready:** the app already running in-region (see Part 5), DevTools open on the Network
tab, and this repo open to `README.md`'s target-architecture table in case they go deep.

---

## Part 4 — What Vultr will actually cost you

Short version: **run it only while you practice/present, then destroy it. Real cost per
session is a few cents. Your risk is forgetting to destroy it.**

### The instance
This app is a small stateless container (~200 MB image, in-memory, tiny traffic). The smallest
**Cloud Compute** instance is plenty (1 vCPU / 1 GB RAM).

| Tier | Monthly cap | Hourly | A 3-hour practice session |
|---|---|---|---|
| 1 vCPU / 1 GB (Regular) | ~$5–6/mo | ~$0.007–0.009/hr | **~$0.02–0.03** |
| 1 vCPU / 2 GB | ~$10/mo | ~$0.015/hr | ~$0.05 |

Ten practice sessions ≈ **~$0.25**. Leaving one running an entire month is the ~$5–10 case —
which is exactly what you avoid by destroying it after each session.

> Confirm exact prices in the Vultr dashboard — **Johannesburg / sovereign-region pricing can
> differ from US regions**, and the cheapest tier isn't offered in every region. Pick the
> lowest tier that's available in the sovereign region.

### ⚠️ The one thing that actually costs money if you forget
**Vultr bills an instance hourly whether it's powered on OR off.** Powering off is NOT enough.
To stop billing you must **DESTROY (delete) the instance.** Because this app rebuilds from the
repo in ~2–3 minutes, the cheap, safe pattern is:

> **Provision before you practice → destroy the moment you're done.** Don't keep it around.

### Other line items — how to keep them at zero
- **Reserved / floating IP:** a reserved IP that isn't attached to a running instance is billed
  (~a few $/mo). **Don't reserve one** — use the instance's default IP that comes free with it.
- **Snapshots:** Vultr charges a small monthly fee per GB for snapshots. You don't need one —
  the "snapshot" is this git repo. Skip them.
- **Container Registry:** not needed. Build the image on the instance from the repo (Part 5).
  → $0.
- **Bandwidth:** the included transfer (≥1 TB) dwarfs anything a demo uses. → $0.
- **Object storage / block storage:** not used by this container. → $0.

**Net:** a single $5-tier instance, created and destroyed around each session, is the entire
bill. Budget a couple of dollars total for all your rehearsals and the interview.

---

## Part 5 — Deploy to Vultr cheaply (and tear it down)

The plan when you're ready (we'll do this together, and **I'll pause before creating anything
that costs money**):

1. **Provision** one small Cloud Compute instance **in the Johannesburg (sovereign) region** —
   region placement is the whole point of the demo.
2. **Cloud-init** installs Docker, clones this repo, runs `docker build`, and
   `docker run -d -p 80:3000` — no registry, no manual SSH gymnastics. App is live on the
   instance's IP in a couple of minutes.
3. **Smoke-check:** `scripts/smoke.sh http://<instance-ip>` (health, all routes, CSP, egress).
4. **Rehearse / present.**
5. **DESTROY the instance** the moment you're done. Next time, recreate it in ~3 minutes.

You now have a **Vultr API key**, so I can script steps 1–3 and the teardown as two commands
(`deploy` / `destroy`) so there's zero chance of leaving something running. We'll build those
next — but I won't provision anything (i.e. spend a cent) until you say go.

### A note on "sovereign region" honesty
Production Vultr **Sovereign Cloud** (air-gapped, nationals-only control plane) is an
enterprise/contact-sales product. For the demo you deploy in the standard **Johannesburg**
region at self-serve prices — that reproduces the residency + audit UX in-country. Say it
plainly if asked; it's a strength, not a gap.
