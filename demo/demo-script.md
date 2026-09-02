# PlateWeave demo script

Target: 2:20–2:40. Show the working plate in the first ten seconds. Record 1920×1080 or 1440×900, keep the browser's site-tool history visible when possible, and add the voiceover from `transcript.md` before publishing.

## Recording sequence

| Time | Picture | Action / proof |
|---|---|---|
| 0:00–0:12 | Poor seeded plate and risk metrics | State the problem; show 24 samples crowded on edge wells |
| 0:12–0:42 | Codex plus site tools | Paste the golden prompt; show tool calls rather than cell-by-cell clicking |
| 0:42–1:02 | Candidate cards and plate | Compare balance-first vs pipetting-first and apply the recommendation |
| 1:02–1:24 | Human edit panel | Move S12 to D6 and lock it; show version increment |
| 1:24–1:43 | Codex recovery | Ask for revalidation; show stale candidate refusal and regeneration around D6 |
| 1:43–2:08 | Export review | Prepare CSV; demonstrate `approval_required`; click **Approve exact layout** |
| 2:08–2:28 | Receipt | Export once, show layout hash, CSV preview/download, and receipt |
| 2:28–2:38 | Closing frame | Show nine tools, green validation, and “synthetic data” boundary |

## Exact prompts

### Prompt 1

> Use this page's site tools. Keep controls fixed at A1, A12, H1, and H12. Place all 24 samples in interior wells, separate biological replicates, and compare a balance-first layout with a pipetting-first layout. Recommend one and apply it as a reversible preview. Do not export anything.

### Prompt 2

> I moved S12 to D6 and locked it. Apply the previous recommendation only if it is still valid; otherwise regenerate the closest valid balance-first layout while preserving my lock.

### Prompt 3

> Prepare CSV for the current validated layout. Do not export until I approve that exact hash in the page.

After pressing the page approval button:

> I approved the exact preview. Export it once and summarize the validation and receipt.

## Evidence checklist

- Site-tools list shows all nine registrations.
- Recently used list shows semantic calls.
- Candidate metrics and active plate visibly agree.
- D6 retains S12 after regeneration.
- Premature export fails without side effects.
- Receipt binds human approval to the exact layout hash.
