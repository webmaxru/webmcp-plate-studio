import { DomainError, FIXED_CONTROLS, PlateDomain, ROWS, SAMPLES, WELLS, calculateMetrics } from "./domain.js";
import { createToolDefinitions, registerWebMcpTools } from "./webmcp.js";

const domain = new PlateDomain();
const $ = (selector) => document.querySelector(selector);
const prompt = `Use this page's site tools. Keep controls fixed at A1, A12, H1, and H12. Place all 24 samples in interior wells, separate biological replicates, and compare a balance-first layout with a pipetting-first layout. Recommend one and apply it as a reversible preview. Do not export anything.`;
let comparison = null;
let noticeTimer = null;
let csvUrl = null;
const candidateNames = new Map();

function showNotice(message, error = false) {
  const notice = $("#notice");
  notice.textContent = message;
  notice.className = `notice show${error ? " error" : ""}`;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { notice.className = "notice"; }, 3200);
}

function run(operation, successMessage) {
  try {
    const result = operation();
    render();
    if (successMessage) showNotice(successMessage);
    return result;
  } catch (error) {
    if (error instanceof DomainError) {
      domain.log("system", "action_rejected", `${error.code}: ${error.message}`);
      render();
      showNotice(`${error.code}: ${error.message}`, true);
      return null;
    }
    throw error;
  }
}

function sampleFor(id) {
  return SAMPLES.find((sample) => sample.id === id);
}

function isEdge(well) {
  const row = ROWS.indexOf(well[0]);
  const column = Number(well.slice(1)) - 1;
  return row === 0 || row === 7 || column === 0 || column === 11;
}

function renderPlate() {
  const grid = $("#plate-grid");
  const cells = ["<span></span>", ...Array.from({ length: 12 }, (_, index) => `<span class="axis-label">${index + 1}</span>`)];
  for (const row of ROWS) {
    cells.push(`<span class="axis-label">${row}</span>`);
    for (let column = 1; column <= 12; column += 1) {
      const well = `${row}${column}`;
      const item = domain.assignments[well];
      const locked = domain.lockedWells[well] === "human";
      if (!item) {
        cells.push(`<button class="well empty" data-well="${well}" title="${well}: empty" aria-label="${well}, empty"></button>`);
        continue;
      }
      if (item.kind === "control") {
        cells.push(`<button class="well control" data-well="${well}" title="${well}: ${item.label}, fixed" aria-label="${well}, ${item.label}, fixed"><small>${well}</small><strong>CTL</strong></button>`);
        continue;
      }
      const sample = sampleFor(item.id);
      const classes = ["well", sample.condition, locked ? "locked" : "", isEdge(well) ? "edge-risk" : ""].filter(Boolean).join(" ");
      cells.push(`<button class="${classes}" data-well="${well}" title="${well}: ${sample.id}, ${sample.condition}, ${sample.subject} replicate ${sample.replicate}${locked ? ", human locked" : ""}" aria-label="${well}, ${sample.id}, ${sample.condition}${locked ? ", human locked" : ""}"><small>${well}</small><strong>${sample.id}</strong></button>`);
    }
  }
  grid.innerHTML = cells.join("");
  grid.querySelectorAll("[data-well]").forEach((button) => button.addEventListener("click", () => {
    $("#well-select").value = button.dataset.well;
    showNotice(`${button.dataset.well} selected as target well.`);
  }));
}

function metricRow(label, value, percent) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong><div class="metric-track"><i style="width:${Math.max(2, Math.min(100, percent))}%"></i></div></div>`;
}

function renderQuality() {
  const metrics = calculateMetrics(domain.assignments);
  $("#quality-score strong").textContent = metrics.qualityScore;
  $("#metrics").innerHTML = [
    metricRow("Completeness", `${metrics.completenessPercent}%`, metrics.completenessPercent),
    metricRow("Fixed controls", `${metrics.controlCoverage}/4`, metrics.controlCoverage * 25),
    metricRow("Edge samples", metrics.edgeExposure, 100 - metrics.edgeExposure * 4),
    metricRow("Minimum replicate distance", metrics.minReplicateDistance ?? "—", (metrics.minReplicateDistance ?? 0) * 22),
    metricRow("Row imbalance", metrics.rowImbalance, 100 - metrics.rowImbalance * 8),
    metricRow("Column imbalance", metrics.columnImbalance, 100 - metrics.columnImbalance * 8),
    metricRow("Pipetting switches", metrics.pipettingSwitches, 100 - metrics.pipettingSwitches * 3),
  ].join("");
  const validation = domain.validate(domain.version);
  const box = $("#validation");
  if (validation.blockers.length) {
    box.className = "validation-box warn";
    box.textContent = `Blocked · ${validation.blockers.join(" ")}`;
  } else if (validation.warnings.length) {
    box.className = "validation-box warn";
    box.textContent = `Valid with ${validation.warnings.length} warning${validation.warnings.length === 1 ? "" : "s"} · ${validation.warnings.join(" ")}`;
  } else {
    box.className = "validation-box good";
    box.textContent = "Valid · all configured checks pass.";
  }
}

function renderCandidates() {
  const candidates = [...domain.candidates.values()];
  const list = $("#candidate-list");
  if (!candidates.length) {
    list.innerHTML = `<div class="candidate-card"><p class="strategy">No proposals yet</p><h3>Generate two deterministic layouts below.</h3></div>`;
  } else {
    list.innerHTML = candidates.map((candidate, index) => {
      const stale = candidate.sourceStateVersion !== domain.version;
      const name = candidateNames.get(candidate.candidateId) || `Candidate ${String.fromCharCode(65 + index)}`;
      candidateNames.set(candidate.candidateId, name);
      return `<article class="candidate-card${stale ? " stale" : ""}">
        <header><div><span class="strategy">${candidate.strategy.replaceAll("_", " ")}</span><h3>${name}</h3></div><strong>${candidate.metrics.qualityScore}</strong></header>
        <dl><dt>ID</dt><dd>${candidate.candidateId}</dd><dt>Edge samples</dt><dd>${candidate.metrics.edgeExposure}</dd><dt>Min distance</dt><dd>${candidate.metrics.minReplicateDistance}</dd><dt>Tip switches</dt><dd>${candidate.metrics.pipettingSwitches}</dd><dt>Source</dt><dd>v${candidate.sourceStateVersion}${stale ? " · stale" : ""}</dd></dl>
        <button class="button compact ${stale ? "ghost" : "secondary"}" data-apply="${candidate.candidateId}">${stale ? "Try stale candidate" : "Apply preview"}</button>
      </article>`;
    }).join("");
    list.querySelectorAll("[data-apply]").forEach((button) => button.addEventListener("click", () => {
      run(() => domain.applyCandidate({ candidateId: button.dataset.apply, expectedStateVersion: domain.version }, "human"), "Candidate applied as a reversible preview.");
    }));
  }
  $("#comparison").innerHTML = comparison
    ? `Recommended: <strong>${comparison.recommendedCandidateId}</strong> · ${comparison.rationale}`
    : "Generate both strategies, then compare their page-computed trade-offs.";
}

function renderExport() {
  const approvalState = $("#approval-state");
  const approve = $("#approve-export");
  const exportApproved = $("#export-approved");
  if (!domain.preview) {
    approvalState.textContent = "Not prepared";
    approvalState.className = "mini-state";
    approve.disabled = true;
    exportApproved.disabled = true;
    $("#csv-preview").textContent = "No preview yet.";
  } else if (domain.approval?.usedAt) {
    approvalState.textContent = "Exported";
    approvalState.className = "mini-state approved";
    approve.disabled = true;
    exportApproved.disabled = true;
    $("#csv-preview").textContent = domain.preview.csv;
  } else if (domain.approval) {
    approvalState.textContent = "Human approved";
    approvalState.className = "mini-state approved";
    approve.disabled = true;
    exportApproved.disabled = false;
    $("#csv-preview").textContent = domain.preview.csv;
  } else {
    approvalState.textContent = `Approval required · ${domain.preview.layoutHash}`;
    approvalState.className = "mini-state";
    approve.disabled = false;
    exportApproved.disabled = true;
    $("#csv-preview").textContent = domain.preview.csv;
  }
  const receipt = [...domain.receipts.values()].at(-1);
  const container = $("#receipt");
  if (!receipt) {
    container.innerHTML = "";
  } else {
    if (csvUrl) URL.revokeObjectURL(csvUrl);
    csvUrl = URL.createObjectURL(new Blob([receipt.csv], { type: "text/csv" }));
    container.innerHTML = `<strong>${receipt.receiptId}</strong> · ${receipt.layoutHash}<br><a href="${csvUrl}" download="plateweave-${receipt.layoutHash}.csv">Download exported CSV</a>`;
  }
}

function renderLedger() {
  const events = domain.activity.toReversed();
  $("#event-count").textContent = `${events.length} event${events.length === 1 ? "" : "s"}`;
  $("#ledger").innerHTML = events.map((event) => `<li class="${event.actor}"><time>v${event.version}</time><b>${event.actor}</b> · ${event.summary}</li>`).join("");
}

function render() {
  const snapshot = domain.snapshot();
  $("#layout-hash").textContent = snapshot.layoutHash;
  $("#state-version").textContent = `v${snapshot.stateVersion}`;
  $("#plate-summary").textContent = `${snapshot.metrics.completenessPercent}% assigned · ${snapshot.metrics.edgeExposure} edge samples · ${Object.values(domain.lockedWells).filter((owner) => owner === "human").length} human locks`;
  renderPlate();
  renderQuality();
  renderCandidates();
  renderExport();
  renderLedger();
}

function populateSelects() {
  $("#sample-select").innerHTML = SAMPLES.map((sample) => `<option value="${sample.id}"${sample.id === "S12" ? " selected" : ""}>${sample.id} · ${sample.condition} · ${sample.subject} R${sample.replicate}${sample.scarce ? " · scarce" : ""}</option>`).join("");
  $("#well-select").innerHTML = WELLS.map((well) => `<option value="${well}"${well === "D6" ? " selected" : ""}>${well}${FIXED_CONTROLS[well] ? " · fixed control" : ""}</option>`).join("");
}

$("#copy-prompt").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(prompt); showNotice("Golden judge prompt copied."); }
  catch { showNotice("Clipboard unavailable; copy from README instead.", true); }
});
$("#reset").addEventListener("click", () => {
  domain.reset();
  comparison = null;
  candidateNames.clear();
  render();
  showNotice("Seeded demo reset to v1.");
});
$("#undo").addEventListener("click", () => run(() => domain.undo(), "Previous plate state restored."));
$("#generate-balance").addEventListener("click", () => run(() => domain.generateCandidate({ strategy: "balance_first", seed: "judge-balance-v1", expectedStateVersion: domain.version }), "Balance-first candidate computed; active plate unchanged."));
$("#generate-pipetting").addEventListener("click", () => run(() => domain.generateCandidate({ strategy: "pipetting_first", seed: "judge-pipetting-v1", expectedStateVersion: domain.version }), "Pipetting-first candidate computed; active plate unchanged."));
$("#compare").addEventListener("click", () => run(() => {
  const ids = [...domain.candidates.keys()].slice(-2);
  comparison = domain.compare(ids);
  return comparison;
}, "Two candidates compared."));
$("#move-form").addEventListener("submit", (event) => {
  event.preventDefault();
  run(() => domain.moveSample({
    sampleId: $("#sample-select").value,
    targetWellId: $("#well-select").value,
    expectedStateVersion: domain.version,
    lockWell: $("#lock-check").checked,
  }, "human"), "Human edit applied; earlier candidates are stale.");
});
$("#prepare-export").addEventListener("click", () => run(() => domain.prepareExport({ format: "csv", expectedStateVersion: domain.version }, "human"), "CSV preview prepared; visible approval is still required."));
$("#approve-export").addEventListener("click", () => run(() => domain.approveExport(), "Exact visible layout approved by human."));
$("#export-approved").addEventListener("click", () => run(() => domain.exportApproved({
  layoutHash: domain.preview?.layoutHash,
  idempotencyKey: `human-${domain.preview?.exportIntentId || "missing"}`,
}, "human"), "Approved CSV exported once; receipt and download are ready."));

populateSelects();
render();

const modelContext = document.modelContext || navigator.modelContext;
const tools = createToolDefinitions(domain, render);
const registration = registerWebMcpTools(modelContext, tools, ({ state, registered, errors }) => {
  const status = $("#webmcp-status");
  if (state === "ready") {
    status.className = "status-pill ready";
    status.innerHTML = `<i></i> WebMCP ready · ${registered} tools`;
  } else if (state === "partial") {
    status.className = "status-pill partial";
    status.innerHTML = `<i></i> ${registered}/9 tools · ${errors.length} errors`;
  } else if (state === "unavailable") {
    status.className = "status-pill";
    status.innerHTML = "<i></i> Manual mode · WebMCP unavailable";
  }
});
await registration.ready;
window.addEventListener("pagehide", () => registration.dispose(), { once: true });
window.__plateStudio = { domain, tools, registration, render };
