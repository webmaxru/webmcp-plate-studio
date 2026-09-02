import { asToolResult, SAMPLES, WELLS } from "./domain.js";

const objectSchema = (properties = {}, required = []) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false,
});

const version = { type: "integer", minimum: 1, description: "Exact stateVersion last read from this page." };
const wellId = { type: "string", enum: WELLS, description: "Stable 96-well identifier from A1 through H12." };
const sampleId = { type: "string", enum: SAMPLES.map((sample) => sample.id), description: "Synthetic sample identifier." };

function checkCancelled(signal) {
  if (signal?.aborted) throw signal.reason || new DOMException("Tool execution was cancelled.", "AbortError");
}

export function createToolDefinitions(domain, updateUi) {
  const execute = (operation) => async (input = {}, options = {}) => {
    checkCancelled(options.signal);
    const output = asToolResult(() => operation(input));
    updateUi();
    checkCancelled(options.signal);
    return output;
  };
  return [
    {
      name: "get_experiment_brief",
      title: "Get experiment brief",
      description: "Read the current synthetic experiment, sample identities, fixed controls, human locks, constraints, and state version before planning a layout.",
      inputSchema: objectSchema(),
      annotations: { readOnlyHint: true },
      execute: execute(() => domain.brief()),
    },
    {
      name: "inspect_plate",
      title: "Inspect plate",
      description: "Read the visible plate assignments, locks, hash, and page-computed layout metrics. Use full mode when exact well assignments are needed.",
      inputSchema: objectSchema({ mode: { type: "string", enum: ["summary", "full"], description: "Summary metrics or full assignments." } }, ["mode"]),
      annotations: { readOnlyHint: true },
      execute: execute(({ mode }) => domain.inspect(mode)),
    },
    {
      name: "generate_candidate_layout",
      title: "Generate candidate layout",
      description: "Compute a deterministic candidate around current fixed and human-locked wells. This does not change the active plate; call set_active_layout to apply it.",
      inputSchema: objectSchema({
        strategy: { type: "string", enum: ["balance_first", "pipetting_first"], description: "Trade-off the page should optimize." },
        seed: { type: "string", minLength: 1, maxLength: 64, description: "Reproducible seed, for example judge-balance-v1." },
        expectedStateVersion: version,
      }, ["strategy", "seed", "expectedStateVersion"]),
      annotations: { readOnlyHint: true },
      execute: execute((input) => domain.generateCandidate(input)),
    },
    {
      name: "compare_layouts",
      title: "Compare two layouts",
      description: "Compare exactly two page-generated candidates using page-computed balance, separation, edge, and pipetting metrics without changing the active plate.",
      inputSchema: objectSchema({ candidateIds: { type: "array", minItems: 2, maxItems: 2, uniqueItems: true, items: { type: "string" }, description: "Two candidate IDs returned by generate_candidate_layout." } }, ["candidateIds"]),
      annotations: { readOnlyHint: true },
      execute: execute(({ candidateIds }) => domain.compare(candidateIds)),
    },
    {
      name: "set_active_layout",
      title: "Apply candidate preview",
      description: "Apply one current candidate to the visible plate as a reversible preview. Rejects stale candidates and never exports.",
      inputSchema: objectSchema({ candidateId: { type: "string", description: "Candidate ID returned by this page." }, expectedStateVersion: version }, ["candidateId", "expectedStateVersion"]),
      execute: execute((input) => domain.applyCandidate(input, "agent")),
    },
    {
      name: "move_sample",
      title: "Move one sample",
      description: "Move one synthetic sample to a stable well ID on the visible plate, optionally human-locking it. Fixed controls and existing human locks are enforced.",
      inputSchema: objectSchema({ sampleId, targetWellId: wellId, expectedStateVersion: version, lockWell: { type: "boolean", description: "Whether to preserve this position in future generated candidates." } }, ["sampleId", "targetWellId", "expectedStateVersion"]),
      execute: execute((input) => domain.moveSample(input, "agent")),
    },
    {
      name: "validate_active_layout",
      title: "Validate active layout",
      description: "Validate the current visible plate for sample completeness, uniqueness, fixed controls, edge exposure, and replicate separation before export preparation.",
      inputSchema: objectSchema({ expectedStateVersion: version }, ["expectedStateVersion"]),
      annotations: { readOnlyHint: true },
      execute: execute(({ expectedStateVersion }) => domain.validate(expectedStateVersion)),
    },
    {
      name: "prepare_export",
      title: "Prepare CSV export",
      description: "Prepare a visible CSV preview for the exact current validated layout. This never exports; a human must approve the hash in the page first.",
      inputSchema: objectSchema({ format: { type: "string", enum: ["csv"], description: "CSV is the only MVP export format." }, expectedStateVersion: version }, ["format", "expectedStateVersion"]),
      execute: execute((input) => domain.prepareExport(input, "agent")),
    },
    {
      name: "export_approved_layout",
      title: "Export approved layout",
      description: "Export exactly once after the human approved the same visible layout hash in the page. Returns approval_required until that visible action occurs; same idempotency key returns the original receipt.",
      inputSchema: objectSchema({
        layoutHash: { type: "string", pattern: "^L-[A-F0-9]{8}$", description: "Exact hash returned by prepare_export." },
        idempotencyKey: { type: "string", minLength: 6, maxLength: 64, pattern: "^[A-Za-z0-9._-]+$", description: "Stable unique key for this one intended export." },
      }, ["layoutHash", "idempotencyKey"]),
      execute: execute((input) => domain.exportApproved(input, "agent")),
    },
  ];
}

export function registerWebMcpTools(modelContext, tools, onStatus = () => {}) {
  if (!modelContext) {
    onStatus({ state: "unavailable", registered: 0, errors: [] });
    return { ready: Promise.resolve(), dispose() {} };
  }
  const controller = new AbortController();
  const registeredNames = [];
  const errors = [];
  const ready = Promise.all(tools.map(async (tool) => {
    try {
      await modelContext.registerTool(tool, { signal: controller.signal });
      registeredNames.push(tool.name);
    } catch (error) {
      errors.push({ name: tool.name, message: error instanceof Error ? error.message : String(error) });
    }
  })).then(() => {
    onStatus({ state: errors.length ? "partial" : "ready", registered: registeredNames.length, errors });
  });
  return {
    ready,
    dispose() {
      for (const name of registeredNames.splice(0).reverse()) {
        try { modelContext.unregisterTool?.(name); } catch { /* old preview cleanup only */ }
      }
      controller.abort();
      onStatus({ state: "disposed", registered: 0, errors });
    },
  };
}
