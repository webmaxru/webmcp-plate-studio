# PlateWeave

> Working title: the challenge guidance recommends that the entrant personally confirm the final project name.

## One-line Summary

A scientist and an AI agent co-design a validated 96-well plate: the human fixes precious samples and approves the exact export while WebMCP gives the agent precise, state-aware spatial operations.

## Problem

Microplate layouts combine sample identity, fixed controls, replicate separation, row/column balance, edge effects, and pipetting order across 96 nearly identical wells. Scientists understand that visual canvas, but a screen-driving agent has to infer semantics from cells and coordinates. One mistaken click can duplicate a sample, move a control, or reuse a plan after the human changed the plate.

## Solution

PlateWeave is a synthetic design studio with one shared, versioned state. The person can use the familiar 96-well interface, set or lock samples, compare candidates, and inspect the CSV. The agent uses nine imperative WebMCP tools to read exact identities, generate deterministic alternatives, compare page-computed metrics, apply a reversible layout, recover from stale human edits, validate, and prepare export. The page—not the model—enforces every constraint.

The final export is deliberately human-owned. Codex can prepare the exact CSV and hash, but the page returns `approval_required` until the scientist presses a visible approval button. The internal grant is bound to that version and hash, revoked by edits, consumed once, and protected by an idempotency key.

## Why This Matters

Laboratory staff spend attention on repetitive spatial allocation where small clerical errors are expensive. This demonstrator shows a credible division of labor: scientists retain experimental judgment and approval, while an agent handles precise batch operations and explains measurable trade-offs. It makes no medical claim and controls no instrument.

## Why WebMCP Fits

The plate is exactly the kind of dense visual surface where coordinate automation is weakest. WebMCP turns “click many similar cells correctly” into stable operations over sample IDs, well IDs, strategies, and state versions. The agent and human work on the same live plate and can see each other's changes immediately. Without WebMCP, preserving a human D6 lock while regenerating the remaining 23 samples is a fragile browser task; with it, that is one validated semantic operation.

## How We Used AI

- Codex planned and implemented the static app, deterministic domain model, WebMCP contracts, tests, and submission artifacts.
- The locally installed `webmaxru/web-ai-agent-skills` WebMCP skill grounded the implementation in the current imperative API and compatibility model.
- During the product demo, Codex is the WebMCP client that selects and sequences page tools from the user's natural-language goal.
- All scientific data and metrics are deterministic mock data; no generative model produces scientific results.

## How We Used Codex

Codex converted the scenario into a narrow executable state machine, split the domain engine from browser registration, implemented nine schemas and lifecycle cleanup, and built regression tests for stale state, approval, idempotency, and cancellation. On 2026-09-02, Codex's desktop in-app Browser discovered all nine tools from the public deployment and successfully invoked the experiment read plus both candidate-generation strategies.

## Key Features

- Complete interactive 8×12 plate with 24 synthetic samples and four fixed controls.
- Deterministic balance-first and pipetting-first candidates with a real metric trade-off.
- Reversible candidate application and human sample locks.
- Exact state-version checks and stale-candidate recovery.
- Page-derived completeness, control, edge, separation, balance, and pipetting metrics.
- Nine typed imperative WebMCP tools with annotations and cancellation.
- Hash-bound visible approval and idempotent CSV export receipt.
- Human-only mode when WebMCP is unavailable.

## Architecture

The project is dependency-free HTML, CSS, and JavaScript served by a small Node static server. `src/domain.js` owns normalized state and all business rules. `src/app.js` renders the plate and sends human actions through that domain, including a complete prepare/approve/export path without an agent. `src/webmcp.js` wraps the same methods as top-level imperative tools using `document.modelContext || navigator.modelContext`, awaited registration in `try`/`catch`, strict JSON schemas backed by runtime validation, `AbortController` cleanup, conservative read-only annotations, and per-call cancellation.

## Testing Instructions

1. Run `npm start` with Node 20+ and open `http://127.0.0.1:4173`.
2. Run `npm run check`; all twelve tests should pass.
3. In the ChatGPT desktop in-app browser, or Google Chrome 149+ with `chrome://flags/#enable-webmcp-testing`, confirm nine site tools are discoverable.
4. Follow the three exact prompts in `demo/demo-script.md`.
5. Verify S12 remains at D6 after stale recovery.
6. Verify premature export returns `approval_required`, then approve in the page and export once.
7. Retry with the same idempotency key and confirm no duplicate receipt.

## Public Demo Link

https://webmaxru.github.io/webmcp-plate-studio/

Keep this live app free, publicly accessible, and unrestricted through September 21, 2026 at 5:00 pm PT.

## Public Repository Link

https://github.com/webmaxru/webmcp-plate-studio

## Demo Video

https://www.youtube.com/watch?v=FjriwBNjET4

## YouTube title and description

**Title**

`PlateWeave: Can AI Design 96 Wells Without Moving the Sample That Matters? | WebMCP`

**Description**

```text
One wrong well can invalidate an experiment. Yet a 96-well plate asks a scientist to balance controls, edge effects, replicates, and pipetting order across nearly identical cells.

In this 2:22 Codex demo, PlateWeave turns that dense visual canvas into nine precise WebMCP tools. Codex generates and compares two valid layouts, preserves the scientist's locked sample at D6, detects when a human edit makes its prior plan stale, and prepares an exact CSV. Export remains blocked until the scientist approves the exact current preview.

The data and scoring are deterministic and synthetic. This prototype controls no laboratory instrument and makes no medical claim.

Try it: https://webmaxru.github.io/webmcp-plate-studio/
Source: https://github.com/webmaxru/webmcp-plate-studio

Built for the WebMCP Challenge.

#WebMCP #AIAgents #LabAutomation #Codex
```

## Screenshot Shot List

See `demo/shot-list.md`. Priority images: seeded risk, candidate comparison, human D6 lock/stale state, approval preview, completed receipt, and site-tools history.

## Submission Readiness Notes

The product flow, public live URL, public source code, license, local run instructions, automated tests, four gallery screenshots, public narrated YouTube video, and representative native Codex WebMCP evidence exist. On 2026-09-03, `npm run check` passed all twelve tests, the live app returned HTTP 200, and YouTube exposed the expected public video metadata. Remaining blockers are entrant confirmation of the project title and required entrant-specific form answers.

## Known Limitations

- Synthetic single-plate demonstrator; no LIMS, robot, persistence, authentication, uploads, or patient data.
- Scoring heuristics illustrate layout trade-offs; they are not statistical or biological advice.
- In-memory approval and receipts reset on reload.
- Native WebMCP availability depends on the client/browser rollout.

## TODO Official Form Fields

| Devpost field | Draft answer |
|---|---|
| Submitter Type (`28249`) | TODO entrant: choose Individual / Team of Individuals / Organization |
| Country of residence of yourself and team members if applicable (`28250`) | TODO entrant |
| If submitting on behalf of an organization, what is the organization name? (`28251`) | Leave blank unless submitting for an organization |
| App Status (`28252`) | New |
| If Existing, explain what you updated during the submission period (`28253`) | Not applicable; new during submission period |
| Live URL that judges can access using ChatGPT’s in-app browser or Google Chrome with WebMCP enabled (`28254`) | https://webmaxru.github.io/webmcp-plate-studio/ |
| If applicable, testing instructions for application (`28255`) | No credentials; use the Testing Instructions above |
| URL to your PUBLIC Code Repo (`28256`) | https://github.com/webmaxru/webmcp-plate-studio |
| Which agent(s) or client(s) did you test your WebMCP tools with? (`28257`) | OpenAI Codex desktop in-app Browser: PASS on 2026-09-02; nine tools discovered and three representative calls succeeded. The host reports `codex-cli 0.152.1`; the desktop app version was not separately visible. |
| Which AI tools have you leveraged while working on this project? (`28258`) | OpenAI Codex; `webmaxru/web-ai-agent-skills` WebMCP skill |
| Describe the level of learning you/your team derived from the project (`28259`) | Significant — entrant to confirm |
| Did you gain AI value that you can use in your career? (`28260`) | Yes — entrant to confirm |
