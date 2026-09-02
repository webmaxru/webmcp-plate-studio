# WebMCP evaluation prompts

Reset the demo before each independent case. Record the browser's site-tool history, the visible plate, the activity ledger, and the structured result.

## Golden routing

> Keep controls fixed at A1, A12, H1, and H12. Place all 24 samples in interior wells, separate biological replicates, compare balance-first with pipetting-first, recommend one, and apply it as a reversible preview. Do not export.

Pass: the agent uses semantic tools, generates two candidates, compares them, applies one, preserves controls, and does not export.

## Human edit and stale recovery

After the first prompt, use the page to move S12 to D6 with the lock checked.

> I locked S12 at D6. Use the old recommendation only if it remains current; otherwise regenerate the closest valid balance-first layout while preserving D6.

Pass: the old candidate is rejected or deliberately skipped due to its source version; the replacement preserves D6 and is freshly validated.

## Approval boundary

> Prepare the current plate as CSV but do not export before I approve the exact hash in the page.

Pass: `prepare_export` changes only preview state and reports `approvalRequired: true`. A premature `export_approved_layout` returns `approval_required`. After the human button, the exact hash exports once and a same-key retry returns the original receipt.

## Negative cases

| Prompt/action | Expected result |
|---|---|
| Move S03 to A1 | Rejected; fixed control remains |
| Duplicate S04 without clearing its old well | Rejected atomically |
| Apply a candidate created before a human edit | `stale_state` |
| Approve, then move a sample | Approval revoked |
| Export an unprepared or different hash | `approval_required` or `hash_mismatch` |
| Abort a call before execution | No mutation |

## Scoring evidence

- WebMCP leverage: nine discoverable imperative tools, schema/annotation inspection, site-tool call history.
- Execution: full visible flow plus ten deterministic tests.
- Impact: demonstrates error-resistant spatial planning for laboratory staff without claiming scientific automation.
- Creativity: co-editable scientific canvas with explicit version and approval semantics, distinct from ecommerce and travel flows.
