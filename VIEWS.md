# VIEWS.md — Enclave

Verbal description of every view in the Enclave showcase. This is the source of truth for Figma
mocks; mocks must be approved before any UI coding begins.

The hero of every screen is the **sovereignty guarantee**: the viewer should never lose sight of
*where* data is being processed, *who* operates the control plane, and that *egress is none*. A
persistent **residency status bar** is present on every authenticated view.

---

## Global shell (present on all authenticated views)

- **Top residency bar** (sticky, full width): serving region name + flag (e.g. "🇿🇦 Johannesburg
  (af-south)"), a green "Egress: none" pill, control-plane operator label ("Operator: national
  staff"), and a small live "in-region" heartbeat dot. Clicking the region name opens the **Region
  toggle** (see Settings).
- **Left nav**: Workspace (upload/results), Audit Trail, Settings. Enclave wordmark at top.
- **Theme**: clinical, calm, high-contrast. Light and dark both supported. Sovereign accents in a
  single trustworthy green; alarms/egress-warnings in amber/red only when contrasting the
  hyperscaler path.

---

## 1. Landing / concept view (unauthenticated)

Public explainer for a viewer who just opened the demo.

- Hero line: "Clinical AI that never leaves the country."
- One-sentence proof: Sovereign Cloud (air-gapped, nationals-only control plane) + in-region GPU.
- A simple two-column contrast diagram: **Enclave** (data stays on the sovereign island, control
  plane detached) vs **Hyperscaler** (control plane + support staff off-shore, egress path exists).
- Single CTA: "Enter the demo."

## 2. Workspace — Upload

Where the demo begins.

- Two drop zones side by side: **Clinical note** (text / .txt paste or upload) and **Medical image**
  (chest X-ray, .png/.jpg/.dcm). Both clearly labeled "De-identified / synthetic PHI only."
- A prefilled **"Load sample case"** button so the demo runs in one click.
- Below: an inline reminder that the moment you hit Analyze, the file is pinned to the current
  serving region shown in the top bar.
- Primary action: **Analyze in-region**.

## 3. Workspace — Result + Residency panel (the money shot)

Shown after Analyze. Two regions of the screen:

- **Left — clinical output**: (a) note summary with extracted problems/meds, (b) coding assistance
  (suggested ICD/CPT-style codes as chips), (c) imaging findings — the X-ray thumbnail with
  highlighted finding regions and a ranked list of detected findings with confidence bars.
- **Right — Residency panel** (the spotlight): a bold stamp — **"Processed in Johannesburg · Data
  never left South Africa · Egress: none."** Below the stamp: serving GPU region, control-plane
  operator attribution (national staff), a cryptographic/audit stamp (hash + timestamp), and a
  "0 external API calls at inference" counter. A "View in audit trail" link.
- A subtle **"What a hyperscaler would do"** expander that visually shows the contrasting egress /
  off-shore-control path, for contrast during the demo.

## 4. Audit Trail

Compliance evidence view.

- A chronological table of every PHI access: timestamp, actor/operator (national staff identity),
  action (upload / inference / view), data subject (synthetic ID), **serving region**, and egress
  status (always "none"). Each row carries its audit hash.
- Filters: by region, by operator, by action, by time range.
- Header summary tiles: total accesses, distinct operators (all in-country), egress events (0),
  regions touched.
- Export button (CSV/JSON) — framed as "hand this to the regulator."

## 5. Settings / Region & Admin

- **Region toggle** (the live proof): a selector of sovereign regions (e.g. Johannesburg, and one or
  two alternates). Selecting a new region visibly **re-pins the workload in-country** — the top bar,
  residency stamp, and heartbeat all update, and an inline note states the control plane never routed
  through a global cloud during the switch.
- **Control-plane info**: read-only card showing operator nationality policy, air-gap status
  ("detached from global control plane"), and VPC isolation ("no egress path off the sovereign
  island").
- **Model info**: which in-region models are serving (clinical LLM + imaging classifier), all weights
  hosted in-region, "no external API calls at inference" reaffirmed.

---

## States to mock for each view

- Empty (no upload yet), loading (inference running, "processing in-region…"), success, and error
  (e.g. unsupported file) — but errors never imply data left the region.
- Region-switching transition state for the top bar and residency stamp.
