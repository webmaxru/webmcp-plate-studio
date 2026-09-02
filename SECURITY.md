# Security and scope

PlateWeave uses synthetic data and has no backend. Do not enter real patient, subject, or laboratory identifiers.

## Boundaries

- Tool names and annotations are routing hints, not authorization.
- All tool inputs are validated again in the domain layer.
- Every mutation checks `expectedStateVersion`.
- Fixed controls and human locks are enforced atomically.
- The export tool cannot create page approval; approval is a visible human action bound to the exact version and layout hash.
- Any edit revokes approval. An idempotency key prevents duplicate export events.
- Registration cleanup and execution cancellation use separate signals.

CSV remains local to the browser. This prototype does not send or persist it. Report security issues privately to the repository owner before public disclosure.
