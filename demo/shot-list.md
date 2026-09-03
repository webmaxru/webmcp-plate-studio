# Shot list

Two jobs here: the frames the recorded video must land, and the still images used for the Devpost gallery and thumbnail. Capture at 1920×1080 or 1440×900. No bookmarks, no notifications, no personal browser chrome. The fresh Codex session and the sidebar hide are recorded on camera as the first shot (V0), not prepared off-camera.

## Video frames (in order)

Published final runtime: **2:22**, under the three-minute limit. [Watch the completed video on YouTube](https://www.youtube.com/watch?v=FjriwBNjET4). "Scroll cue" is the Browser move that must land *before* the listed event; "Cursor/halo" is where a visible cursor or click halo must sit while the voiceover names it — use the post-production fallback overlay (below) if the live cursor isn't legible in the capture.

| # | Beat | Must be legible in frame | Scroll cue | Cursor/halo | Speed |
|---|---|---|---|---|---|
| V0 | Fresh session, hidden sidebar | New/empty Codex session, then the sidebar collapsing so only composer + in-app Browser remain | n/a | On **New session**, then on the sidebar collapse control | Normal |
| V1 | Full-page scan (cold open) | Smooth scroll top → **Layout quality** → **Candidate layouts** → **Protect a scarce sample** → **Review & export**/**Activity ledger** → bottom; brief hold; smooth scroll back to top, landing on the full 96-well grid | Continuous scroll, both directions | None — hands off cursor during the scan itself | Normal, real-time scroll (do not speed-ramp; VO1 covers it) |
| V2 | Cost of the problem | Layout quality panel: edge samples, minimum replicate distance, row/column imbalance (`#metrics`) | Settle on Layout quality panel | Halo moves row to row as each metric is named | Normal |
| V3 | Ninety-six identical targets | Plate close-up with sample tooltips on hover, then the full grid again | Scroll back to 96-well response screen | Halo hovers 2–3 perimeter wells, then pulls back | Normal |
| V4 | Tool surface | Codex site-tools inspector listing all nine tools; status pill `WebMCP ready · 9 tools` | Settle near status pill | Halo rests on the open inspector list | Normal |
| V5 | Hero prompt | Prompt 1 in the composer, then the tool-call stream with semantic names visible | Scroll to Layout quality for `get_experiment_brief`/`inspect_plate`, then to Candidate layouts for `generate_candidate_layout` ×2 and `compare_layouts` | Halo tracks to whichever panel the current call is reading | **Accelerate 2–3×** (scroll moves stay real-time; only waiting/streaming speeds up) |
| V6 | Trade-off | Both candidate cards side by side with different scores, plus the recommendation line | Hold on Candidate layouts panel | Halo on the recommended card | Normal |
| V7 | Preview applied | Plate repainting from edge-heavy to interior; score climbing; version chip incrementing | Scroll to 96-well response screen just before `set_active_layout` lands | Halo on `#state-version` as it increments, then on the wells that move | Normal, never cut |
| V8 | Human authority | S12 landing on D6 with the ◆ lock, and both candidate cards flipping to stale | Scroll to Protect a scarce sample panel, then keep D6 corner of the grid in frame | Halo on the sample/well dropdowns, then on the ◆ lock glyph at D6 | Normal, hold |
| V9 | Stale recovery | Codex refusing the stale candidate, regenerating, validating — D6 unchanged throughout | Scroll to Candidate layouts for the stale badges, then to Layout quality/Review & export for `validate_active_layout`/`prepare_export` | Halo on the "stale" badge, then on `#validation` as it turns green | **Accelerate 2–3×** |
| V10 | Refusal | Export panel showing `Approval required · L-XXXXXXXX` beside the agent's refused `export_approved_layout` call | Hold on Review & export panel | Halo on `#approval-state` | Normal, hold ~3s |
| V11 | Human approval | The **Approve exact layout** click and the state flipping to human approved | Hold on Review & export panel | Halo on the **Approve exact layout** button at the moment of click | Normal |
| V12 | Receipt | Receipt ID, layout hash, download link, the same-key retry returning that same receipt, and the ledger with human/agent attribution | Hold on `#receipt`, then scroll to Activity ledger | Halo on the layout hash, then on each ledger entry's human/agent tag | Normal |
| V13 | Closing frame | Whole page: green validation, receipt, ledger, synthetic-data footer | Settle back on full page | None | Static hold |

## Post-production fallback for the cursor

If Codex's automated/background browser control does not render a visible system cursor in the capture for any shot above (V2–V12 all require one), do not re-narrate around it — overlay a high-contrast synthetic cursor with a subtle click halo in post, synchronized exactly to the recorded interaction's real coordinates and timing. The overlay is a pointer only: it must never depict a click, selection, or page-state change that did not actually occur in the footage. If a needed state change is missing, re-record the shot instead of faking it with the overlay.

## Stills for submission

1. `01-seeded-risk.png` — first viewport, edge-heavy plate, four fixed controls, quality panel, WebMCP-ready badge.
2. `02-candidate-comparison.png` — both candidate cards, the metric trade-off, the recommendation, and the full plate.
3. `03-human-lock-stale.png` — S12 locked at D6, incremented version, stale candidate cards and ledger entry.
4. `04-export-approval.png` — exact CSV preview and layout hash with approval still required.
5. `05-receipt.png` — completed receipt, download link, consumed approval, final metrics.
6. `06-site-tools.png` — site-tool inspector showing nine tools and the recently used calls.

Thumbnail: crop shot 2 so the plate and both candidate scores stay readable. No stock laboratory imagery — the product surface is the evidence.
