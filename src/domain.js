export const ROWS = Object.freeze(["A", "B", "C", "D", "E", "F", "G", "H"]);
export const COLUMNS = Object.freeze(Array.from({ length: 12 }, (_, index) => index + 1));
export const WELLS = Object.freeze(ROWS.flatMap((row) => COLUMNS.map((column) => `${row}${column}`)));
export const FIXED_CONTROLS = Object.freeze({
  A1: { id: "CTRL-NEG-1", label: "Negative control", kind: "control" },
  A12: { id: "CTRL-POS-1", label: "Positive control", kind: "control" },
  H1: { id: "CTRL-NEG-2", label: "Negative control", kind: "control" },
  H12: { id: "CTRL-BLANK", label: "Blank", kind: "control" },
});

export class DomainError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.details = details;
  }
}

function createSamples() {
  const samples = [];
  let index = 1;
  for (const condition of ["vehicle", "treatment"]) {
    for (let subject = 1; subject <= 4; subject += 1) {
      for (let replicate = 1; replicate <= 3; replicate += 1) {
        samples.push({
          id: `S${String(index).padStart(2, "0")}`,
          condition,
          subject: `${condition === "vehicle" ? "V" : "T"}${subject}`,
          replicate,
          requiredVolumeUl: index === 12 ? 18 : 25,
          scarce: index === 12,
        });
        index += 1;
      }
    }
  }
  return samples;
}

export const SAMPLES = Object.freeze(createSamples());
const SAMPLE_MAP = new Map(SAMPLES.map((sample) => [sample.id, sample]));

function position(well) {
  return { row: ROWS.indexOf(well[0]), column: Number(well.slice(1)) - 1 };
}

function isEdge(well) {
  const { row, column } = position(well);
  return row === 0 || row === 7 || column === 0 || column === 11;
}

function interiorWells() {
  return WELLS.filter((well) => !isEdge(well));
}

function copyAssignments(assignments) {
  return Object.fromEntries(Object.entries(assignments).map(([well, item]) => [well, { ...item }]));
}

function initialAssignments() {
  const result = copyAssignments(FIXED_CONTROLS);
  const perimeter = WELLS.filter((well) => isEdge(well) && !FIXED_CONTROLS[well]);
  SAMPLES.forEach((sample, index) => {
    result[perimeter[index]] = { kind: "sample", id: sample.id };
  });
  return result;
}

function variance(values) {
  if (!values.length) return 0;
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  return values.reduce((total, value) => total + ((value - mean) ** 2), 0) / values.length;
}

function stableHash(text) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return (value >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

export function layoutHash(assignments) {
  const canonical = Object.entries(assignments)
    .sort(([left], [right]) => WELLS.indexOf(left) - WELLS.indexOf(right))
    .map(([well, item]) => `${well}:${item.kind}:${item.id}`)
    .join("|");
  return `L-${stableHash(canonical)}`;
}

export function calculateMetrics(assignments) {
  const occurrences = new Map();
  const sampleWells = [];
  for (const [well, item] of Object.entries(assignments)) {
    if (item.kind !== "sample") continue;
    sampleWells.push([well, item.id]);
    occurrences.set(item.id, (occurrences.get(item.id) || 0) + 1);
  }
  const missing = SAMPLES.filter((sample) => !occurrences.has(sample.id)).map((sample) => sample.id);
  const duplicates = [...occurrences.entries()].filter(([, count]) => count > 1).map(([id]) => id);
  const edgeExposure = sampleWells.filter(([well]) => isEdge(well)).length;
  const controlCoverage = Object.entries(FIXED_CONTROLS)
    .filter(([well, control]) => assignments[well]?.id === control.id).length;

  let minReplicateDistance = null;
  for (const subject of new Set(SAMPLES.map((sample) => sample.subject))) {
    const wells = sampleWells
      .filter(([, id]) => SAMPLE_MAP.get(id)?.subject === subject)
      .map(([well]) => position(well));
    for (let left = 0; left < wells.length; left += 1) {
      for (let right = left + 1; right < wells.length; right += 1) {
        const distance = Math.abs(wells[left].row - wells[right].row)
          + Math.abs(wells[left].column - wells[right].column);
        minReplicateDistance = minReplicateDistance === null
          ? distance
          : Math.min(minReplicateDistance, distance);
      }
    }
  }

  const conditionDifference = (wells) => {
    const counts = { vehicle: 0, treatment: 0 };
    for (const well of wells) {
      const id = assignments[well]?.id;
      const sample = SAMPLE_MAP.get(id);
      if (sample) counts[sample.condition] += 1;
    }
    return counts.treatment - counts.vehicle;
  };
  const rowImbalance = variance(ROWS.slice(1, -1).map((row) => (
    conditionDifference(COLUMNS.slice(1, -1).map((column) => `${row}${column}`))
  )));
  const columnImbalance = variance(COLUMNS.slice(1, -1).map((column) => (
    conditionDifference(ROWS.slice(1, -1).map((row) => `${row}${column}`))
  )));

  const orderedConditions = sampleWells
    .sort(([a], [b]) => WELLS.indexOf(a) - WELLS.indexOf(b))
    .map(([, id]) => SAMPLE_MAP.get(id)?.condition);
  let pipettingSwitches = 0;
  for (let index = 1; index < orderedConditions.length; index += 1) {
    if (orderedConditions[index] !== orderedConditions[index - 1]) pipettingSwitches += 1;
  }
  const separationPenalty = Math.max(0, 3 - (minReplicateDistance ?? 0));
  const qualityScore = Math.max(0, Math.round(
    100 - edgeExposure * 3 - rowImbalance * 3 - columnImbalance * 1.5
    - separationPenalty * 10 - pipettingSwitches * 0.35,
  ));

  return {
    completenessPercent: Math.round(((SAMPLES.length - missing.length) / SAMPLES.length) * 100),
    missing,
    duplicates,
    edgeExposure,
    minReplicateDistance,
    rowImbalance: Number(rowImbalance.toFixed(2)),
    columnImbalance: Number(columnImbalance.toFixed(2)),
    controlCoverage,
    pipettingSwitches,
    qualityScore,
  };
}

function seededNumber(seedText) {
  let state = Number.parseInt(stableHash(seedText), 16) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function assertVersion(expected, current) {
  if (!Number.isInteger(expected)) {
    throw new DomainError("invalid_input", "expectedStateVersion must be an integer.");
  }
  if (expected !== current) {
    throw new DomainError("stale_state", `State v${expected} is stale; the plate is now v${current}.`, {
      expectedStateVersion: expected,
      currentStateVersion: current,
      validNextActions: ["get_experiment_brief", "inspect_plate", "generate_candidate_layout"],
    });
  }
}

function assertStrategy(strategy) {
  if (!["balance_first", "pipetting_first"].includes(strategy)) {
    throw new DomainError("invalid_strategy", "strategy must be balance_first or pipetting_first.");
  }
}

function candidateAssignments(currentAssignments, lockedWells, strategy, seed) {
  const result = copyAssignments(FIXED_CONTROLS);
  const lockedSampleIds = new Set();
  for (const [well, owner] of Object.entries(lockedWells)) {
    const item = currentAssignments[well];
    if (owner === "human" && item?.kind === "sample") {
      result[well] = { ...item };
      lockedSampleIds.add(item.id);
    }
  }
  const available = interiorWells().filter((well) => !result[well]);
  const random = seededNumber(`${strategy}:${seed}`);
  const rotate = Math.floor(random() * available.length);
  let orderedWells;
  if (strategy === "balance_first") {
    const woven = [];
    for (let columnIndex = 0; columnIndex < 10; columnIndex += 1) {
      const rows = columnIndex % 2 === 0 ? ROWS.slice(1, -1) : ROWS.slice(1, -1).toReversed();
      for (const row of rows) woven.push(`${row}${columnIndex + 2}`);
    }
    orderedWells = [...woven.slice(rotate), ...woven.slice(0, rotate)].filter((well) => !result[well]);
  } else {
    orderedWells = [...available.slice(rotate), ...available.slice(0, rotate)];
  }

  const remaining = SAMPLES.filter((sample) => !lockedSampleIds.has(sample.id));
  const orderedSamples = strategy === "balance_first"
    ? remaining.toSorted((left, right) => {
      if (left.replicate !== right.replicate) return left.replicate - right.replicate;
      if (left.condition !== right.condition) return left.condition.localeCompare(right.condition);
      return left.subject.localeCompare(right.subject);
    })
    : remaining.toSorted((left, right) => (
      left.condition.localeCompare(right.condition)
      || left.subject.localeCompare(right.subject)
      || left.replicate - right.replicate
    ));

  orderedSamples.forEach((sample, index) => {
    result[orderedWells[index]] = { kind: "sample", id: sample.id };
  });
  return result;
}

function validationFor(assignments) {
  const metrics = calculateMetrics(assignments);
  const blockers = [];
  const warnings = [];
  if (metrics.missing.length) blockers.push(`${metrics.missing.length} samples are missing.`);
  if (metrics.duplicates.length) blockers.push(`${metrics.duplicates.length} samples are duplicated.`);
  if (metrics.controlCoverage !== 4) blockers.push("One or more fixed controls moved.");
  if (metrics.edgeExposure) warnings.push(`${metrics.edgeExposure} experimental samples are on edge wells.`);
  if ((metrics.minReplicateDistance ?? 0) < 3) warnings.push("At least one biological replicate pair is closer than three wells.");
  return { metrics, blockers, warnings, exportReady: blockers.length === 0 };
}

export class PlateDomain {
  constructor() {
    this.reset();
  }

  reset() {
    this.version = 1;
    this.assignments = initialAssignments();
    this.lockedWells = Object.fromEntries(Object.keys(FIXED_CONTROLS).map((well) => [well, "system"]));
    this.candidates = new Map();
    this.preview = null;
    this.approval = null;
    this.receipts = new Map();
    this.history = [];
    this.activity = [{ id: 1, actor: "system", action: "reset", version: 1, summary: "Seeded deliberately poor edge-heavy layout." }];
    return this.snapshot();
  }

  snapshot() {
    return {
      stateVersion: this.version,
      assignments: copyAssignments(this.assignments),
      lockedWells: { ...this.lockedWells },
      metrics: calculateMetrics(this.assignments),
      layoutHash: layoutHash(this.assignments),
    };
  }

  brief() {
    return {
      experimentId: "SYN-96-001",
      title: "Synthetic response-screen plate",
      plateFormat: "96-well",
      stateVersion: this.version,
      samples: SAMPLES.map((sample) => ({ ...sample })),
      fixedControls: Object.entries(FIXED_CONTROLS).map(([well, item]) => ({ well, ...item })),
      humanLocks: Object.entries(this.lockedWells).filter(([, owner]) => owner === "human").map(([well]) => well),
      constraints: { avoidEdges: true, minReplicateDistance: 3, balanceAxes: ["row", "column"] },
      validNextActions: ["inspect_plate", "generate_candidate_layout", "move_sample", "validate_active_layout"],
    };
  }

  inspect(mode = "summary") {
    if (!["summary", "full"].includes(mode)) throw new DomainError("invalid_mode", "mode must be summary or full.");
    const snapshot = this.snapshot();
    return mode === "summary"
      ? { stateVersion: this.version, layoutHash: snapshot.layoutHash, metrics: snapshot.metrics, lockedWells: snapshot.lockedWells }
      : snapshot;
  }

  generateCandidate({ strategy, seed, expectedStateVersion }) {
    assertStrategy(strategy);
    assertVersion(expectedStateVersion, this.version);
    if (typeof seed !== "string" || seed.length < 1 || seed.length > 64) {
      throw new DomainError("invalid_seed", "seed must contain 1 to 64 characters.");
    }
    const assignments = candidateAssignments(this.assignments, this.lockedWells, strategy, seed);
    const hash = layoutHash(assignments);
    const candidateId = `${strategy === "balance_first" ? "BAL" : "PIP"}-${hash.slice(2, 8)}`;
    const validation = validationFor(assignments);
    const candidate = {
      candidateId,
      strategy,
      seed,
      sourceStateVersion: this.version,
      assignments,
      layoutHash: hash,
      ...validation,
    };
    this.candidates.set(candidateId, candidate);
    this.log("agent", "candidate_generated", `Computed ${candidateId} with ${strategy.replace("_", " ")}; active plate unchanged.`);
    return this.publicCandidate(candidate);
  }

  publicCandidate(candidate) {
    return {
      candidateId: candidate.candidateId,
      strategy: candidate.strategy,
      seed: candidate.seed,
      sourceStateVersion: candidate.sourceStateVersion,
      layoutHash: candidate.layoutHash,
      metrics: candidate.metrics,
      blockers: candidate.blockers,
      warnings: candidate.warnings,
      assignments: copyAssignments(candidate.assignments),
    };
  }

  compare(candidateIds) {
    if (!Array.isArray(candidateIds) || candidateIds.length !== 2 || candidateIds[0] === candidateIds[1]) {
      throw new DomainError("invalid_candidates", "Provide two different candidate IDs.");
    }
    const candidates = candidateIds.map((id) => this.candidates.get(id));
    if (candidates.some((candidate) => !candidate)) throw new DomainError("candidate_not_found", "One or more candidate IDs do not exist.");
    const [left, right] = candidates;
    const recommendation = left.metrics.qualityScore >= right.metrics.qualityScore ? left : right;
    this.log("agent", "candidates_compared", `Compared ${left.candidateId} with ${right.candidateId}.`);
    return {
      stateVersion: this.version,
      candidates: candidates.map((candidate) => ({ candidateId: candidate.candidateId, strategy: candidate.strategy, metrics: candidate.metrics })),
      recommendedCandidateId: recommendation.candidateId,
      rationale: "Recommendation uses page-computed edge, balance, replicate-separation, and pipetting-switch metrics.",
    };
  }

  applyCandidate({ candidateId, expectedStateVersion }, actor = "agent") {
    assertVersion(expectedStateVersion, this.version);
    const candidate = this.candidates.get(candidateId);
    if (!candidate) throw new DomainError("candidate_not_found", `Candidate ${candidateId} does not exist.`);
    if (candidate.sourceStateVersion !== this.version) {
      throw new DomainError("stale_candidate", `Candidate ${candidateId} was built from v${candidate.sourceStateVersion}, not current v${this.version}.`, {
        candidateSourceStateVersion: candidate.sourceStateVersion,
        currentStateVersion: this.version,
        validNextActions: ["get_experiment_brief", "generate_candidate_layout"],
      });
    }
    this.saveHistory();
    this.assignments = copyAssignments(candidate.assignments);
    this.version += 1;
    this.revokeApproval();
    this.log(actor, "candidate_applied", `Applied ${candidateId} as a reversible preview.`);
    return { ok: true, candidateId, ...this.snapshot(), validNextActions: ["validate_active_layout", "undo_last_change"] };
  }

  moveSample({ sampleId, targetWellId, expectedStateVersion, lockWell = false }, actor = "agent") {
    assertVersion(expectedStateVersion, this.version);
    if (!SAMPLE_MAP.has(sampleId)) throw new DomainError("sample_not_found", `Unknown sample ${sampleId}.`);
    if (!WELLS.includes(targetWellId)) throw new DomainError("well_not_found", `Unknown well ${targetWellId}.`);
    if (FIXED_CONTROLS[targetWellId] || this.lockedWells[targetWellId] === "system") {
      throw new DomainError("locked_control", `${targetWellId} is a fixed control and cannot be changed.`);
    }
    const sourceWell = Object.entries(this.assignments).find(([, item]) => item.kind === "sample" && item.id === sampleId)?.[0];
    if (!sourceWell) throw new DomainError("sample_not_assigned", `${sampleId} is not assigned to the plate.`);
    if (this.lockedWells[sourceWell] === "human" && sourceWell !== targetWellId) {
      throw new DomainError("human_lock", `${sampleId} is human-locked at ${sourceWell}; unlock it before moving.`);
    }
    const targetItem = this.assignments[targetWellId];
    this.saveHistory();
    if (targetItem?.kind === "sample" && sourceWell !== targetWellId) this.assignments[sourceWell] = { ...targetItem };
    else if (sourceWell !== targetWellId) delete this.assignments[sourceWell];
    this.assignments[targetWellId] = { kind: "sample", id: sampleId };
    if (lockWell) this.lockedWells[targetWellId] = "human";
    if (sourceWell !== targetWellId && this.lockedWells[sourceWell] === "human") delete this.lockedWells[sourceWell];
    this.version += 1;
    this.revokeApproval();
    this.log(actor, "sample_moved", `Moved ${sampleId} from ${sourceWell} to ${targetWellId}${lockWell ? " and human-locked it" : ""}.`);
    return { ok: true, sampleId, sourceWell, targetWellId, lockedByHuman: Boolean(lockWell), ...this.snapshot() };
  }

  validate(expectedStateVersion) {
    assertVersion(expectedStateVersion, this.version);
    return { stateVersion: this.version, layoutHash: layoutHash(this.assignments), ...validationFor(this.assignments) };
  }

  prepareExport({ format, expectedStateVersion }, actor = "agent") {
    assertVersion(expectedStateVersion, this.version);
    if (format !== "csv") throw new DomainError("invalid_format", "Only csv export is supported.");
    const validation = validationFor(this.assignments);
    if (!validation.exportReady) throw new DomainError("validation_failed", "The layout has blocking validation errors.", validation);
    const hash = layoutHash(this.assignments);
    const csv = this.buildCsv();
    this.preview = { format, layoutHash: hash, stateVersion: this.version, csv };
    this.approval = null;
    this.log(actor, "export_prepared", `Prepared CSV preview for ${hash}; human approval required.`);
    return {
      ok: true,
      stateVersion: this.version,
      layoutHash: hash,
      approvalRequired: true,
      previewRows: csv.trim().split("\n").length - 1,
      metrics: validation.metrics,
      validNextActions: ["human_approves_in_page", "export_approved_layout"],
    };
  }

  approveExport() {
    if (!this.preview || this.preview.stateVersion !== this.version || this.preview.layoutHash !== layoutHash(this.assignments)) {
      throw new DomainError("preview_stale", "Prepare a fresh CSV preview before approving.");
    }
    this.approval = {
      layoutHash: this.preview.layoutHash,
      stateVersion: this.version,
      approvedAt: new Date().toISOString(),
      usedAt: null,
    };
    this.log("human", "export_approved", `Approved exact layout ${this.preview.layoutHash} in the visible page.`);
    return { ok: true, ...this.approval };
  }

  exportApproved({ layoutHash: requestedHash, idempotencyKey }, actor = "agent") {
    if (typeof idempotencyKey !== "string" || !/^[A-Za-z0-9._-]{6,64}$/.test(idempotencyKey)) {
      throw new DomainError("invalid_idempotency_key", "idempotencyKey must be 6-64 safe characters.");
    }
    const prior = this.receipts.get(idempotencyKey);
    if (prior) return { ...prior, idempotentReplay: true };
    const currentHash = layoutHash(this.assignments);
    if (requestedHash !== currentHash) {
      throw new DomainError("layout_mismatch", `Requested ${requestedHash}, but the visible plate is ${currentHash}.`, { currentLayoutHash: currentHash });
    }
    if (!this.approval || this.approval.layoutHash !== requestedHash || this.approval.stateVersion !== this.version || this.approval.usedAt) {
      throw new DomainError("approval_required", "The human must approve this exact layout in the visible page before export.", {
        layoutHash: currentHash,
        stateVersion: this.version,
      });
    }
    this.approval.usedAt = new Date().toISOString();
    const receipt = {
      ok: true,
      receiptId: `EXP-${requestedHash.slice(2, 8)}-${String(this.receipts.size + 1).padStart(2, "0")}`,
      layoutHash: requestedHash,
      stateVersion: this.version,
      exportedAt: this.approval.usedAt,
      csv: this.preview.csv,
      metrics: calculateMetrics(this.assignments),
      idempotencyKey,
      idempotentReplay: false,
    };
    this.receipts.set(idempotencyKey, receipt);
    this.log(actor, "export_completed", `Exported ${requestedHash} once as ${receipt.receiptId}.`);
    return { ...receipt };
  }

  undo() {
    const prior = this.history.pop();
    if (!prior) throw new DomainError("nothing_to_undo", "There is no reversible plate change to undo.");
    this.assignments = copyAssignments(prior.assignments);
    this.lockedWells = { ...prior.lockedWells };
    this.version += 1;
    this.revokeApproval();
    this.log("human", "change_undone", "Restored the previous plate assignments; candidates are now stale.");
    return this.snapshot();
  }

  saveHistory() {
    this.history.push({ assignments: copyAssignments(this.assignments), lockedWells: { ...this.lockedWells } });
  }

  revokeApproval() {
    this.preview = null;
    this.approval = null;
  }

  buildCsv() {
    const lines = ["well_id,sample_id,condition,subject,replicate,pipetting_order"];
    let order = 1;
    for (const well of WELLS) {
      const item = this.assignments[well];
      if (!item) continue;
      const sample = SAMPLE_MAP.get(item.id);
      lines.push([
        well,
        item.id,
        sample?.condition || "control",
        sample?.subject || item.label || "control",
        sample?.replicate || "",
        order,
      ].join(","));
      order += 1;
    }
    return `${lines.join("\n")}\n`;
  }

  log(actor, action, summary) {
    this.activity.push({ id: this.activity.length + 1, actor, action, version: this.version, summary });
  }
}

export function asToolResult(operation) {
  try {
    return { ok: true, result: operation() };
  } catch (error) {
    if (error instanceof DomainError) {
      return { ok: false, error: { code: error.code, message: error.message, ...error.details } };
    }
    throw error;
  }
}
