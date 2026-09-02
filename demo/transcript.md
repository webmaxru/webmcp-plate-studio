# Voiceover transcript

This is PlateWeave, a synthetic 96-well experiment design studio built for people and agents to use together.

The starting plate is intentionally poor. Twenty-four samples are crowded around the edge, while four controls must remain fixed in the corners. A normal browser agent sees ninety-six similar cells and has to guess what each coordinate means. This page instead exposes nine structured WebMCP tools over the same state used by the visible interface.

I ask Codex to preserve the controls, keep samples in the interior, separate biological replicates, and compare two strategies. The agent reads the exact experiment, generates deterministic balance-first and pipetting-first candidates, and asks the page to compare its own metrics. It applies the balance-first recommendation as a reversible preview. The scientist can see the whole plate change at once and inspect the trade-off rather than trusting a hidden answer.

Now the human contributes judgment. I move scarce reference sample S12 to D6 and lock it. That page action increments the state version. The earlier candidate is now stale, so the agent cannot silently apply it. Codex re-reads the plate, regenerates around D6, and validates the result while preserving my lock.

Export has a separate trust boundary. The agent can prepare an exact CSV preview, but it cannot approve its own work. A premature export returns approval required. I review the hash and click Approve exact layout in the normal page. Only then can the agent export once. The page consumes its private approval grant and produces an attributable receipt. Repeating the same idempotency key returns that receipt instead of exporting twice.

All data is mocked, and this demo does not control laboratory equipment or make biological recommendations. The point is the interaction model: the person supplies scientific intent and approval, while the agent handles precise spatial work through semantic, state-aware WebMCP tools.
