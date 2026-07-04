# Enclave — Sovereign Clinical AI

> One of four Vultr capability-showcase projects. Sibling repos: `mothertongue`, `proxima`, `acre`.
> Optimization target: a **Vultr capability showcase** — a demo that makes the unique thing viscerally
> obvious to a viewer — not (yet) a shipping business.

## Elevator pitch

Enclave is a clinical AI stack — note summarization, coding assistance, and medical-image
triage — that runs **entirely within a single sovereign region**. Every request and every byte of PHI
is pinned in-country, processed on GPUs physically located there, under a control plane that is
air-gapped from the global cloud and administered only by nationals of the host country.

**The single Vultr capability it proves:** Sovereign Cloud (air-gapped + nationals-only detached
control plane) + in-region GPU inference = a legally-defensible "your data never left the country"
guarantee.

## Target user / niche & why hyperscalers can't serve it

Hospitals, ministries of health, and payers in jurisdictions with hard data-localization laws for
health data — Gulf states, South Africa, Indonesia, Brazil, and EU data-residency regimes — that
also lack a compliant in-country hyperscaler GPU region. AWS/GCP/Azure either have no GPU presence in
these regions, or their control plane and support staff sit outside the jurisdiction, which is
exactly what the regulation forbids. Enclave is impossible to replicate without a **detached,
locally-operated control plane**, which only Vultr offers.

## Showcase architecture

- **Compute:** Vultr **Sovereign/Private Cloud** region with in-region **Cloud GPU** for inference.
- **Storage:** encrypted **Object Storage** for PHI + audit logs, region-locked.
- **Network:** **VPC** isolation; no egress path off the sovereign island.
- **Models:** open clinical LLM (summarization/coding) + an imaging classifier (e.g. chest-X-ray
  finding detection). All weights hosted in-region; no external API calls at inference time.
- **Capability spotlight (make it *visible*):** a live **data-residency panel** on every result
  showing the serving region, a cryptographic/audit stamp ("processed in <country>, control plane
  operator: national staff, egress: none"), and a **region toggle** that visibly re-pins the workload
  in-country. An **audit trail** view lists every PHI access with region + operator attribution.

## Demo script (~60s)

1. Upload a de-identified clinical note + a chest X-ray.
2. Enclave summarizes the note and flags imaging findings — response stamped **"Processed in
   Johannesburg · Data never left South Africa · Egress: none."**
3. Open the audit trail: every access attributed to in-country operators.
4. Flip the region toggle to another sovereign region → the residency stamp updates; nothing ever
   routes through a global control plane. Contrast on-screen with "what a hyperscaler would do."

## Next steps for the build Claude

1. Author **`VIEWS.md`** describing every view (upload, result + residency panel, audit trail,
   region/admin settings).
2. Create **Figma mocks** from `VIEWS.md` and get user approval **before any UI coding** (global rule).
3. Run **`/factory`** to build the feature end-to-end into a reviewable PR.
4. Keep all PHI synthetic/de-identified in the showcase. Treat the sovereign guarantees as the hero;
   consider the `emr-counsel` agent for an adversarial compliance pressure-test of the data flow.
