# PlateWeave technical specification

## Product boundary

PlateWeave is a static, synthetic 96-well design demonstrator. It has no backend, accounts, uploads, patient data, hardware control, or biological recommendations. One normalized in-memory domain object powers both the visible controls and nine WebMCP tools.

## Golden state transition

```text
seeded poor plate (v1)
  -> generate two non-destructive candidates
  -> compare page-computed metrics
  -> apply one reversible candidate (v2)
  -> human moves S12 to D6 and locks it (v3)
  -> old candidate rejected as stale
  -> regenerate around D6 and apply (v4)
  -> validate
  -> prepare exact CSV/hash
  -> human approves exact hash in page
  -> export once with idempotency key
  -> receipt
```

Every mutation carrying `expectedStateVersion` fails closed on a mismatch. A layout change clears the preview and approval. Approval is page-held; the model receives only the layout hash.

## Tool surface

| Tool | Kind | Contract |
|---|---|---|
| `get_experiment_brief` | Read | Samples, constraints, controls, locks, version |
| `inspect_plate` | Read | Summary or exact assignments and computed metrics |
| `generate_candidate_layout` | Read/compute | Deterministic candidate from strategy, seed, version |
| `compare_layouts` | Read/compute | Exactly two candidate IDs and derived trade-off |
| `set_active_layout` | Reversible write | Applies a current candidate visibly |
| `move_sample` | Reversible write | Moves one sample while enforcing controls and locks |
| `validate_active_layout` | Read/compute | Blockers, warnings, metrics, export readiness |
| `prepare_export` | Reversible write | CSV preview and exact hash; approval still required |
| `export_approved_layout` | Consequential write | Consumes page approval once; supports idempotent replay |

`src/webmcp.js` uses `document.modelContext || navigator.modelContext`, awaits asynchronous registration inside `try`/`catch`, keeps one `AbortController` for registration lifetime, and honors the independent per-call execution signal. Only `get_experiment_brief`, `inspect_plate`, and `validate_active_layout` declare `readOnlyHint`; proposal generation and comparison have visible side effects. Schema constraints are also enforced at runtime, including required fields, types, enums, patterns, uniqueness, and rejection of additional properties.

## Deterministic layout model

- Fixed controls: A1, A12, H1, H12.
- Synthetic samples: S01–S24 across vehicle/treatment conditions and biological replicates.
- Candidate seeds make the judge run reproducible.
- Metrics are derived by the page: completeness, fixed-control coverage, edge exposure, minimum replicate distance, row/column imbalance, pipetting switches, quality score.
- Strategies differ: `balance_first` optimizes spatial balance; `pipetting_first` reduces condition transitions.
- Candidate generation preserves all human-locked wells.

## Trust and failure behavior

- Unknown samples/wells, fixed-control moves, duplicate placement, malformed hashes, stale versions, unprepared exports, and unapproved exports return structured corrective errors.
- UI rendering completes before a tool result resolves.
- Human and agent paths invoke the same `PlateDomain` methods.
- The no-WebMCP UI can prepare, visibly approve, and perform the same one-time approved export.
- CSV export is local and synthetic; it never sends data to a server.
- WebMCP absence leaves the full human interface operational.

## Verification

`npm run check` runs syntax checks plus eleven deterministic Node tests. The fake `modelContext` verifies tool names, schemas, annotations, runtime input rejection, registration signals, cleanup, cancellation, stale errors, and UI-before-result ordering. Native discovery and natural-language routing still require a supported visible WebMCP client.
