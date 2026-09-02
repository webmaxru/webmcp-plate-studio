import test from "node:test";
import assert from "node:assert/strict";
import { PlateDomain } from "../src/domain.js";
import { createToolDefinitions, registerWebMcpTools } from "../src/webmcp.js";

test("all nine imperative tools register asynchronously with one lifecycle signal", async () => {
  const registered = [];
  const removed = [];
  const statuses = [];
  const fakeModelContext = {
    async registerTool(tool, options) {
      await Promise.resolve();
      registered.push({ tool, options });
    },
    unregisterTool(name) { removed.push(name); },
  };
  const tools = createToolDefinitions(new PlateDomain(), () => {});
  const registration = registerWebMcpTools(fakeModelContext, tools, (status) => statuses.push(status));
  await registration.ready;
  assert.equal(registered.length, 9);
  assert.equal(new Set(registered.map(({ tool }) => tool.name)).size, 9);
  assert.ok(registered.every(({ tool }) => tool.inputSchema.type === "object"));
  assert.ok(registered.every(({ options }) => options.signal instanceof AbortSignal));
  assert.equal(tools.filter((tool) => tool.annotations?.readOnlyHint).length, 5);
  assert.deepEqual(statuses.at(-1), { state: "ready", registered: 9, errors: [] });
  const signal = registered[0].options.signal;
  registration.dispose();
  assert.equal(signal.aborted, true);
  assert.equal(removed.length, 9);
});

test("tool execution updates UI before its structured result resolves", async () => {
  const domain = new PlateDomain();
  let updates = 0;
  const tools = createToolDefinitions(domain, () => { updates += 1; });
  const move = tools.find((tool) => tool.name === "move_sample");
  const result = await move.execute({ sampleId: "S12", targetWellId: "D6", expectedStateVersion: 1, lockWell: true }, { signal: new AbortController().signal });
  assert.equal(result.ok, true);
  assert.equal(updates, 1);
  assert.equal(domain.assignments.D6.id, "S12");
});

test("stale input returns a corrective structured tool error", async () => {
  const domain = new PlateDomain();
  const tools = createToolDefinitions(domain, () => {});
  const generate = tools.find((tool) => tool.name === "generate_candidate_layout");
  const result = await generate.execute({ strategy: "balance_first", seed: "stale", expectedStateVersion: 99 }, { signal: new AbortController().signal });
  assert.equal(result.ok, false);
  assert.equal(result.error.code, "stale_state");
  assert.equal(result.error.currentStateVersion, 1);
  assert.ok(result.error.validNextActions.includes("get_experiment_brief"));
});

test("an aborted execution does not mutate plate state", async () => {
  const domain = new PlateDomain();
  const tools = createToolDefinitions(domain, () => {});
  const move = tools.find((tool) => tool.name === "move_sample");
  const controller = new AbortController();
  controller.abort(new Error("cancelled"));
  await assert.rejects(() => move.execute({ sampleId: "S12", targetWellId: "D6", expectedStateVersion: 1, lockWell: true }, { signal: controller.signal }), /cancelled/);
  assert.equal(domain.version, 1);
});
