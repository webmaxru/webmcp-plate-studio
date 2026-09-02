# WebMCP Challenge rules validation

Checked against the live Devpost MCP data on 2026-09-02. The official site and rules prevail over this helper document.

## Status

| Requirement | Status | Evidence / next action |
|---|---|---|
| WebMCP-powered web app | PASS in source and deterministic tests | Nine top-level imperative tools in `src/webmcp.js`; registration test passes |
| Runnable and consistent | PASS locally | `npm run check` passes; no install or external service required |
| Working live URL accessible to judges | BLOCKED | GitHub Pages creation on 2026-09-02 returned HTTP 422 because the current plan does not support Pages for this private repository; publish elsewhere or make the repository public, then verify in a fresh session |
| WebMCP tested in ChatGPT/Codex in-app browser or enabled Chrome | BLOCKED | Local fake-context tests pass; a native in-app browser run must be recorded |
| Text description covers fit, UX, joint capability, implementation | PASS draft | `devpost-submission.md` |
| Public YouTube demo, under 3 minutes, with audio | BLOCKED | Script and transcript exist; record, add voiceover, upload publicly |
| Public code repository | BLOCKED BY REQUEST | Repository is intentionally private; change visibility only with owner approval |
| Complete source, assets, run instructions | PASS locally | README, app, server, tests, docs, and demo package are present |
| Detectable open-source license | PASS in repository contents | MIT `LICENSE`; detection can be verified once repository is public |
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
- The working project must stay accessible through the judging period.

## Automated evidence

Run:

```bash
npm run check
```

Expected: syntax checks succeed and ten tests pass. Tests cover deterministic candidate generation, controls, real strategy trade-off, D6 preservation, stale state, atomic rejection, page approval, approval revocation, idempotency, nine registrations, schemas/annotations, UI-before-result, and cancellation.

## Native Codex acceptance run

Use the four prompts in `demo/demo-script.md`. Save:

1. Site-tools inspector screenshot with nine tools.
2. Recently used history for the golden trace.
3. Screenshot after D6 lock and stale recovery.
4. Screenshot before approval and after receipt.
5. Exact client/model/app version used.

Do not change this row to PASS until a native site-tool call—not a DOM click or fake context—has succeeded.

Attempt recorded on 2026-09-02: Codex's in-app Browser binding was selected and made visible, but two fresh localhost tab attempts timed out while waiting for the Browser webview to attach. A direct Codex-panel browser open also failed to attach. No native site-tool success is claimed.

## Required final actions

1. Publish and verify a live URL.
2. Complete native Codex in-app-browser validation.
3. Record the scripted demo, add voiceover, and publish it on YouTube.
4. With explicit owner approval, make the GitHub repository public and verify the MIT license while logged out.
5. Replace all TODO values in `devpost-submission.md` and submit before the deadline.
