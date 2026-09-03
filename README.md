# PlateWeave — Reliable 96-Well Designs Without Costly Layout Mistakes

> This project was created using the [WebMCP Agent Skill from the Web AI Agent Skills collection](https://github.com/webmaxru/web-ai-agent-skills).

PlateWeave is a synthetic 96-well experimental-design studio where a scientist and a browser agent share one visible, versioned plate. It is an entry for the WebMCP Challenge.

The page starts with 24 mock samples clustered on edge wells. A human or agent can generate two deterministic candidates, compare page-computed balance and pipetting trade-offs, apply a reversible proposal, preserve a scarce sample at D6, recover from stale state, validate the exact plate, and export only after a visible hash-bound human approval.

## Why WebMCP

A 96-well grid is understandable to a scientist but brittle for a screen-driving agent: it contains 96 similar targets, and coordinates do not convey sample identity, fixed controls, replicate rules, or whether a candidate was computed from stale state. PlateWeave exposes nine semantic, imperative page tools over the same domain commands as the human UI.

| Tool | Effect |
|---|---|
| `get_experiment_brief` | Reads samples, constraints, controls, locks, and version |
| `inspect_plate` | Reads exact visible assignments and page-computed metrics |
| `generate_candidate_layout` | Computes a deterministic proposal without changing the active plate |
| `compare_layouts` | Compares exactly two generated candidates |
| `set_active_layout` | Applies a current candidate as a reversible preview |
| `move_sample` | Moves one sample while enforcing fixed and human locks |
| `validate_active_layout` | Reports blockers, warnings, metrics, and export readiness |
| `prepare_export` | Shows an exact CSV preview and layout hash; does not export |
| `export_approved_layout` | Exports once only after visible page approval of that hash |

Only the three genuinely side-effect-free reads declare `readOnlyHint`; candidate generation and comparison deliberately do not because they update visible proposals or activity. All calls have strict JSON schemas plus matching runtime validation. Registration uses `document.modelContext || navigator.modelContext`, awaits each `registerTool` inside `try`/`catch`, passes an `AbortController` registration signal, accepts per-execution cancellation, and updates UI before returning structured output.

## Run locally

Requirements: Node.js 20+. For challenge testing, native WebMCP requires the ChatGPT desktop in-app browser or Google Chrome 149 or later with `chrome://flags/#enable-webmcp-testing` enabled. The public app is HTTPS and loopback localhost is treated as trustworthy; WebMCP is unavailable in workers or headless execution.

```bash
npm start
```

Open `http://127.0.0.1:4173`. The complete human workflow remains usable when WebMCP is unavailable, including preparing, visibly approving, and exporting the exact CSV once. Run deterministic tests with:

```bash
npm test
npm run check
```

## Golden Codex prompt

> Use this page's site tools. Keep controls fixed at A1, A12, H1, and H12. Place all 24 samples in interior wells, separate biological replicates, and compare a balance-first layout with a pipetting-first layout. Recommend one and apply it as a reversible preview. Do not export anything.

Then move S12 to D6 and lock it in the human UI:

> I moved S12 to D6 and locked it. Apply the previously recommended candidate only if it is still valid; otherwise regenerate the closest valid balance-first layout while preserving my lock.

Finally:

> Prepare the CSV export for the current validated layout, but do not export until I approve that exact layout in the page.

After pressing **Approve exact layout**:

> I approved the exact preview. Export it once and summarize the validation and receipt.

## Safety and scope

- All data is deterministic and synthetic; there are no patient identifiers.
- This demonstrator does not control laboratory hardware and makes no biological or medical recommendations.
- Candidate application and moves are reversible.
- Fixed controls cannot move. Human locks survive regeneration.
- State-version preconditions reject stale assumptions.
- Export approval is held only by the page, bound to the current layout hash and version, revoked by any edit, consumed once, and protected by an idempotency key.

Architecture, implementation details, evaluation prompts, limitations, and the complete submission materials are in [`docs/`](./docs/), [`evals/`](./evals/), [`demo/`](./demo/), [`SUBMISSION.md`](./SUBMISSION.md), and [`RULES-VALIDATION.md`](./RULES-VALIDATION.md).

Four tracked 16:9 gallery frames, suggested alt text, intended placement, and an accessible social card are in [`submission-assets/`](./submission-assets/README.md).

## Status

The implementation, automated domain/registration tests, [public source repository](https://github.com/webmaxru/webmcp-plate-studio), [GitHub Pages deployment from this repository](https://webmaxru.github.io/webmcp-plate-studio/), published [2:22 Codex demo](https://www.youtube.com/watch?v=FjriwBNjET4), and representative native WebMCP validation are complete. Entrant-specific fields and final challenge submission remain.

The live app must remain free, publicly accessible, and unrestricted through September 21, 2026 at 5:00 pm PT.

## Challenge provenance

Repository history starts with the initial app build on September 2, 2026. This is a new challenge project, not a WebMCP layer added to a pre-existing application. It remains substantially distinct from Islanding: this repository focuses on laboratory spatial allocation, human well locks, layout metrics, and CSV export rather than infrastructure switching and restoration safety.

MIT licensed. See [`LICENSE`](./LICENSE).
