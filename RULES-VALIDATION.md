# WebMCP Challenge rules validation

Checked against the live Devpost MCP data on 2026-09-02. The official site and rules prevail over this helper document.

## Status

| Requirement | Status | Evidence / next action |
|---|---|---|
| WebMCP-powered web app | PASS in source and deterministic tests | Nine top-level imperative tools in `src/webmcp.js`; registration test passes |
| Runnable and consistent | PASS locally | `npm run check` passes; no install or external service required |
| Working live URL free and unrestricted through judging | PASS; ongoing availability required | `https://webmaxru.github.io/webmcp-plate-studio/` returned HTTP 200 with the expected title in an anonymous HTTPS request on 2026-09-02. Keep it free, public, and unrestricted through September 21, 2026 at 5:00 pm PT. |
| WebMCP tested in ChatGPT/Codex in-app browser or enabled Chrome | PASS | OpenAI Codex desktop in-app Browser discovered all nine public-deployment tools and successfully called `get_experiment_brief` plus two `generate_candidate_layout` variants on 2026-09-02 |
| Text description covers fit, UX, joint capability, implementation | PASS draft | `SUBMISSION.md` |
| Public YouTube demo under 3 minutes with audio | PASS | Published [2:22 narrated demo](https://www.youtube.com/watch?v=FjriwBNjET4); the exact-master caption source remains at `demo/demo-captions.srt` |
| Public code repository | PASS | `https://github.com/webmaxru/webmcp-plate-studio`; GitHub API confirmed `isPrivate: false` on 2026-09-02 |
| Complete source, assets, run instructions | PASS locally | README, app, server, tests, docs, and demo package are present |
| Detectable open-source license | PASS | Public repository includes a root MIT `LICENSE`, detected by GitHub |
| New or meaningfully extended during submission period | PASS | Repository and implementation were created during the 2026-08-25–09-03 submission period; preserve commit timestamps |
| Authorized third-party code/data | PASS | No runtime dependencies or external data; synthetic dataset; installed WebMCP skill is documentation under its included MIT license |
| Unique if submitting multiple entries | PASS conceptually | This is a laboratory spatial-design workflow, substantially different from the microgrid simulator and provenance evidence workbench |
| English submission materials | PASS | README, draft, demo, and validation files are in English |

## Live official requirements captured

- Submission deadline: 2026-09-03 20:00 UTC / 1:00 PM Pacific.
- Judging criteria, equally weighted on a five-point scale: WebMCP Leverage; Execution; Potential Impact; Creativity & Ambition.
- Required custom fields include submitter type, country, app status, live URL, public repository URL, tested agents/clients, AI tools used, learning level, and career value.
- Multiple submissions are allowed only when each is unique and substantially different.
- Demo must be publicly visible on YouTube, shorter than three minutes, and include audio covering the app and WebMCP usage. Do not use unlicensed music or trademarks.
- The working project must stay free, publicly accessible, and unrestricted through September 21, 2026 at 5:00 pm PT.

## Automated evidence

Run:

```bash
npm run check
```

Expected: syntax checks succeed and eleven tests pass. Tests cover deterministic candidate generation, controls, real strategy trade-off, D6 preservation, stale state, atomic rejection, page approval, approval revocation, idempotency, nine registrations, schemas/annotations, runtime input rejection, UI-before-result, and cancellation.

## Native Codex acceptance run

Use the three prompts in `demo/demo-script.md`. Save:

1. Site-tools inspector screenshot with nine tools.
2. Recently used history for the golden trace.
3. Screenshot after D6 lock and stale recovery.
4. Screenshot before approval and after receipt.
5. Exact client/model/app version used.

Do not change this row to PASS until a native site-tool call—not a DOM click or fake context—has succeeded.

Attempt recorded on 2026-09-02: Codex's in-app Browser binding was selected and made visible, but two fresh localhost tab attempts timed out while waiting for the Browser webview to attach. A direct Codex-panel browser open also failed to attach. No native site-tool success is claimed.

Retry recorded on 2026-09-02 after public deployment: Codex discovered exactly nine native site tools and successfully read the experiment brief, then generated deterministic balance-first and pipetting-first candidates through WebMCP. The returned candidates preserved all four controls and exposed the intended balance-versus-pipetting trade-off. This supersedes the failed localhost attempt. Some later browser-control focus operations were intermittent, so the supplied demo script should still be used for the final continuous video take.

## Required final actions

1. Confirm the remaining entrant-specific values in `SUBMISSION.md`.
2. Submit the completed entry before the deadline.
