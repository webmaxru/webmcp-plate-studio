# PlateWeave demo script

Planned finished runtime: **2:35** (acceptable band 2:20–2:40, hard limit 3:00). Recorded inside the Codex desktop app with the live deployment open in Codex's in-app Browser, so every WebMCP call judges see is a native site-tool call.

The story is one scientist's problem, one real prompt, and one trust boundary. Do not narrate clicks. Do not read metrics aloud. Voiceover is in [`transcript.md`](./transcript.md); framing is in [`shot-list.md`](./shot-list.md).

## Operator setup (before the first frame)

These are physical operator actions completed **before recording starts**. The fresh-session start and the sidebar hide are deliberately *not* in this list — they are the first thing the camera sees (see 0:00–0:03 below).

1. In a separate, already-open browser tab, load `https://webmaxru.github.io/webmcp-plate-studio/`, confirm the status pill reads **WebMCP ready · 9 tools**, and press **Reset demo** so the plate sits at `v1` with the seeded edge-heavy layout. Leave this tab ready to paste into the in-app Browser, or, if the in-app Browser persists independently of the chat session in your build, pre-load it there directly.
2. Keep the three prompts below on the clipboard or in a scratch buffer — paste them, never type them live.
3. Silence notifications, hide bookmarks, record at 1920×1080 (or 1440×900), and set browser zoom so the full 96-well grid and the quality panel are visible without scrolling once landed on a section.
4. Drive every page click and every Browser scroll yourself. Codex's browser-control focus operations were intermittent during validation; the agent's job in this video is the **site-tool calls**, not moving the mouse or the viewport.
5. Rehearse the scroll choreography in the table below at least once dry so the top→bottom→top pass in the cold open is smooth and single-take.

## Recording sequence

`VO` refers to the numbered spoken paragraphs of `transcript.md`, in order. Trim or stretch the accelerated segments in the edit so each paragraph lands on the visual it describes; never stretch a segment where page state changes. "Scroll to X" means the in-app Browser viewport is moved with the mouse/trackpad before the described event so the relevant panel is already framed when it happens — never a jump-cut to it. "Halo" means a visible cursor with a soft click/hover halo parked over the exact control or card named; see the post-production fallback below if the live cursor isn't legible in the capture.

| Time | VO | Picture | On-screen action | Proof for judges |
|---|---|---|---|---|
| 0:00–0:03 | 1 (lead clause) | Codex app, no session yet | Click **New session**; the empty composer appears; immediately collapse/hide the Codex sidebar so only the composer and the in-app Browser remain | This is a first-run session — no prior turns, no other project names, no account chrome on screen |
| 0:03–0:18 | 1 (hook) | Whole page, top → bottom → top | In-app Browser already on the seeded page: smooth scroll from the header down through the **Layout quality** panel, **Candidate layouts** panel, **Protect a scarce sample** panel, and **Review & export**/**Activity ledger**, reaching the page bottom; hold ~1s; smooth scroll back up, landing on the full **96-well response screen** | The entire product surface is shown before a single prompt is sent — nothing off-screen, nothing staged out of view |
| 0:18–0:30 | 2 | Layout quality panel | Scroll/settle on the **Layout quality** panel; cursor halo moves across the edge-exposure, minimum-replicate-distance, and row/column-imbalance rows in `#metrics` as each is named | Edge exposure, replicate distance, and imbalance are page-computed, not model-claimed |
| 0:30–0:43 | 3 | 96-well response screen, close-up | Scroll back to the plate grid; halo hovers two or three perimeter wells so sample tooltips appear, then pulls back to frame the full grid | Ninety-six near-identical targets; identity lives in the page, not in coordinates |
| 0:43–0:54 | 4 | Site-tools inspector | Scroll/settle near the status pill; open Codex's site-tools list, halo resting on the list as it holds on all nine tools, then close it | Native WebMCP discovery — nine semantic tools spoken and shown at the same moment |
| 0:54–1:14 | 5 | Codex composer → tool stream | Paste **Prompt 1**, send; as each call resolves, scroll the Browser just ahead of it: halo settles on **Layout quality** for `get_experiment_brief`/`inspect_plate`, then on **Candidate layouts** for the two `generate_candidate_layout` calls and `compare_layouts` **[ACCELERATE 2–3× in post]** | `get_experiment_brief`, two `generate_candidate_layout` calls, `compare_layouts`, `set_active_layout` — no coordinate clicking, and the Browser is always already looking at what the call just touched |
| 1:14–1:29 | 5 | Candidate layouts panel → 96-well response screen | Hold framing on both candidate cards for the trade-off and recommendation line, then, just before `set_active_layout` lands, scroll to the **96-well response screen** so the repaint and version-chip increment happen fully in frame; halo tracks from the recommended card to the grid | Two deterministic candidates with a real trade-off, a page-computed recommendation, the whole layout changing at once, the score jumping |
| 1:29–1:41 | 6 | Protect a scarce sample panel | Scroll to/hold on this panel; halo selects **S12** in the sample dropdown, then **D6** in the well dropdown, leaves **Preserve as human lock** checked, and clicks submit; keep the plate grid's D6 corner in frame as the ◆ lock renders | Version increments, the ◆ lock appears at D6, both candidate cards flip to **stale** |
| 1:41–1:54 | 6 | Candidate layouts → Protect a scarce sample → 96-well response screen | Paste **Prompt 2**, send; scroll to **Candidate layouts** just before the stale refusal so the "stale" badges are visible, then to the D6 lock (unchanged) as regeneration happens, then to **Layout quality**/**Review & export** for `validate_active_layout` and `prepare_export` **[ACCELERATE 2–3× in post]** | Stale candidate refused, layout regenerated around D6, `validate_active_layout`, `prepare_export`, then an `export_approved_layout` attempt that returns `approval_required` — S12 never moves |
| 1:54–2:06 | 7 | Review & export panel | Hold framing on the CSV preview, the `Approval required · L-XXXXXXXX` state (`#approval-state`), and the agent's refused export call; halo rests on the approval-state pill | The agent prepared the exact export, attempted it, and was refused by the page with no side effect |
| 2:06–2:19 | 7 | Review & export panel | Halo clicks **Approve exact layout**; keep the panel in frame as the state flips, then paste **Prompt 3** and send **[ACCELERATE lightly if the reply runs past ~8s]** | One hash-bound export authorized only by the human, and a same-key retry that returns the original receipt instead of a second file |
| 2:19–2:35 | 8 | Receipt + ledger → closing frame | Scroll to hold on the receipt (`#receipt`) and download link, halo on the layout hash and the same-key retry result, then to the **Activity ledger** for human/agent attribution, then settle back on the full page for the close | Receipt bound to the exact hash, ledger with human/agent attribution, green validation, synthetic-data footer — a complete product, not a proof of concept |

## Browser choreography, area by area

For every moment Codex reads page state or changes it, the in-app Browser must already be scrolled to the relevant area *before* the event resolves, and must hold that area in frame while the voiceover explains it. This is the concrete mapping for this build's panels:

| Site-tool event / page moment | Scroll destination | Cursor halo target |
|---|---|---|
| `get_experiment_brief`, `inspect_plate` (summary) | Layout quality panel | The metrics rows being read (`#metrics`) |
| `generate_candidate_layout` ×2, `compare_layouts` | Candidate layouts panel | Whichever candidate card is being generated/scored |
| `set_active_layout` | 96-well response screen | The version chip (`#state-version`) as it increments, then the wells that visibly move |
| Human move + lock (S12 → D6) | Protect a scarce sample panel, then plate grid | The sample/well dropdowns, then the ◆ lock glyph at D6 |
| Stale refusal on regeneration | Candidate layouts panel | The "stale" badge and "Try stale candidate" ghost button |
| `validate_active_layout` | Layout quality panel | The validation box (`#validation`) as it turns green |
| `prepare_export` | Review & export panel | The CSV preview (`#csv-preview`) and the layout hash |
| `export_approved_layout` (refused, then approved) | Review & export panel | The `#approval-state` pill, then the **Approve exact layout** button |
| Same-key retry | Review & export panel | The receipt block (`#receipt`) proving it is identical, not new |
| Ledger attribution | Activity ledger | Each entry's human/agent tag as it's named |

## Post-production fallback for the cursor

Codex's own on-screen cursor rendering during automated/background browser control was inconsistent during validation. If the system cursor is not clearly visible or not rendered at all in the captured footage for any beat above:

- Overlay a high-contrast synthetic cursor with a subtle click halo in post, keyed to the *actual recorded interaction coordinates and timestamps* — not to invented ones.
- The overlay is a visual pointer only. It must never be used to imply a click, selection, or page-state change that did not really happen in the capture; if a state change is missing or wrong in the recording, re-record that beat rather than paper over it with the overlay.
- Match halo timing to the moment each click/hover actually registers in the footage (button depress, dropdown open, tooltip appearance), not to the voiceover.

## Exact prompts

Three prompts total. Prompt 1 is the hero and carries the entire design task. Prompts 2 and 3 exist only because the human is deliberately in the loop.

### Prompt 1 — hero prompt

Matches the page's **Copy judge prompt** button verbatim, so judges can reproduce the run.

> Use this page's site tools. Keep controls fixed at A1, A12, H1, and H12. Place all 24 samples in interior wells, separate biological replicates, and compare a balance-first layout with a pipetting-first layout. Recommend one and apply it as a reversible preview. Do not export anything.

### Prompt 2 — after the human lock (sent once S12 is locked at D6 in the page)

> I moved S12 to D6 and locked it. Apply your earlier recommendation only if it is still valid; otherwise regenerate the closest valid balance-first layout that preserves my lock, then validate it and prepare the CSV export. Go ahead and try the export too — I want to see whether you can do that on your own.

### Prompt 3 — after pressing **Approve exact layout**

> I approved the exact preview in the page. Export it once, then try the same export again with the same idempotency key, and tell me what the page returned both times.

## Post-production notes

- **Accelerate:** the two agent thinking/tool-call stretches at 0:54–1:14 and 1:41–1:54, plus any reply latency after Prompt 3. Speed those 2–3× and keep the tool names and the scrolled-to panel legible; do not accelerate through a scroll move itself — let each scroll complete at normal speed, then speed only the waiting/streaming that follows.
- **Never accelerate:** the cold open (0:00–0:18, including the sidebar hide and the full-page scan), the plate repaint at ~1:20, the D6 lock at ~1:35, the approval-required hold at ~2:00, and the receipt reveal at ~2:25. Every state change must be readable at normal speed.
- Static holds have been trimmed throughout versus earlier cuts — replace held silence with a slow, purposeful scroll wherever the panel underneath isn't changing, so screen time still tracks something on screen.
- If a response runs long, cut dead air rather than cutting a beat; each beat above is load-bearing evidence for a judging criterion.
- Add short zoom-ins on the candidate cards, the ◆ lock at D6, and the layout hash. No stock laboratory footage — the product surface is the evidence.
- Mix the voiceover from `transcript.md` over the cut; the narration is written to survive the accelerated sections and to justify the opening scroll (see the added lead clause in paragraph 1).

## Evidence checklist

- The first frames show a fresh Codex session starting and the sidebar disappearing before any narration references the tool surface.
- The opening full-page scroll (top → bottom → hold → top) shows every panel before the hero prompt is sent, with voiceover playing throughout — no silent tour.
- Every retrieval or page-state change has the Browser already scrolled to the relevant panel, with that panel held in frame through the event.
- A visible cursor or cursor halo sits over the exact card/control/well being discussed at each such moment (live capture, or the synthetic fallback overlay if needed).
- Site-tools inspector shows all nine registrations.
- Call history shows semantic tool names, not DOM interactions.
- Candidate metrics and the visible plate agree after the preview is applied.
- S12 is still at D6, still locked, after regeneration.
- The premature export is visibly refused with `approval_required`, and the plate is unchanged by it.
- After approval, the export succeeds once and a same-key retry returns the original receipt.
- The receipt binds the human approval to the exact layout hash, and the ledger attributes each event to human or agent.
- The synthetic-data disclaimer is legible in at least one held frame.
- Finished runtime is at or below 2:40.

## Claim discipline

Say only what the build does. PlateWeave is a synthetic single-plate demonstrator: no LIMS, no instrument control, no patient data, no biological or statistical advice. The quality score is a configured heuristic. Never imply that the agent approves its own export.
