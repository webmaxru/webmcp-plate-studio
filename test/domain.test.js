import test from "node:test";
import assert from "node:assert/strict";
import { DomainError, PlateDomain, layoutHash } from "../src/domain.js";

function candidates(domain) {
  const balance = domain.generateCandidate({ strategy: "balance_first", seed: "judge-balance-v1", expectedStateVersion: domain.version });
  const pipetting = domain.generateCandidate({ strategy: "pipetting_first", seed: "judge-pipetting-v1", expectedStateVersion: domain.version });
  return { balance, pipetting };
}

test("seeded candidate generation is deterministic and preserves controls", () => {
  const first = new PlateDomain();
  const second = new PlateDomain();
  const a = first.generateCandidate({ strategy: "balance_first", seed: "repeatable", expectedStateVersion: 1 });
  const b = second.generateCandidate({ strategy: "balance_first", seed: "repeatable", expectedStateVersion: 1 });
  assert.equal(a.layoutHash, b.layoutHash);
  assert.deepEqual(a.assignments, b.assignments);
  assert.equal(a.metrics.controlCoverage, 4);
  assert.equal(a.metrics.completenessPercent, 100);
  assert.equal(a.metrics.edgeExposure, 0);
});

test("balance and pipetting strategies expose a real, page-computed trade-off", () => {
  const domain = new PlateDomain();
  const { balance, pipetting } = candidates(domain);
  const comparison = domain.compare([balance.candidateId, pipetting.candidateId]);
  assert.equal(comparison.recommendedCandidateId, balance.candidateId);
  assert.ok(balance.metrics.rowImbalance < pipetting.metrics.rowImbalance);
  assert.ok(pipetting.metrics.pipettingSwitches < balance.metrics.pipettingSwitches);
});

test("human D6 lock makes old candidates stale and survives regeneration", () => {
  const domain = new PlateDomain();
  const { balance } = candidates(domain);
  domain.moveSample({ sampleId: "S12", targetWellId: "D6", expectedStateVersion: 1, lockWell: true }, "human");
  assert.throws(
    () => domain.applyCandidate({ candidateId: balance.candidateId, expectedStateVersion: 2 }),
    (error) => error instanceof DomainError && error.code === "stale_candidate",
  );
  const replacement = domain.generateCandidate({ strategy: "balance_first", seed: "recovery-v2", expectedStateVersion: 2 });
  assert.equal(replacement.assignments.D6.id, "S12");
  domain.applyCandidate({ candidateId: replacement.candidateId, expectedStateVersion: 2 });
  assert.equal(domain.assignments.D6.id, "S12");
  assert.equal(domain.lockedWells.D6, "human");
  assert.equal(domain.validate(3).exportReady, true);
});

test("fixed controls reject moves without partial mutation", () => {
  const domain = new PlateDomain();
  const before = layoutHash(domain.assignments);
  assert.throws(
    () => domain.moveSample({ sampleId: "S03", targetWellId: "A1", expectedStateVersion: 1 }),
    (error) => error instanceof DomainError && error.code === "locked_control",
  );
  assert.equal(domain.version, 1);
  assert.equal(layoutHash(domain.assignments), before);
  assert.equal(domain.assignments.A1.id, "CTRL-NEG-1");
});

test("export requires visible hash-bound approval and is idempotent", () => {
  const domain = new PlateDomain();
  const { balance } = candidates(domain);
  domain.applyCandidate({ candidateId: balance.candidateId, expectedStateVersion: 1 });
  const prepared = domain.prepareExport({ format: "csv", expectedStateVersion: 2 });
  assert.throws(
    () => domain.exportApproved({ layoutHash: prepared.layoutHash, idempotencyKey: "judge-export-001" }),
    (error) => error instanceof DomainError && error.code === "approval_required",
  );
  domain.approveExport();
  const receipt = domain.exportApproved({ layoutHash: prepared.layoutHash, idempotencyKey: "judge-export-001" });
  const eventCount = domain.activity.length;
  const replay = domain.exportApproved({ layoutHash: prepared.layoutHash, idempotencyKey: "judge-export-001" });
  assert.equal(replay.receiptId, receipt.receiptId);
  assert.equal(replay.idempotentReplay, true);
  assert.equal(domain.activity.length, eventCount);
  assert.match(receipt.csv, /^well_id,sample_id,condition,subject,replicate,pipetting_order/m);
  assert.equal(receipt.csv.trim().split("\n").length, 29);
});

test("any post-approval plate edit revokes the approval", () => {
  const domain = new PlateDomain();
  const { balance } = candidates(domain);
  domain.applyCandidate({ candidateId: balance.candidateId, expectedStateVersion: 1 });
  const prepared = domain.prepareExport({ format: "csv", expectedStateVersion: 2 });
  domain.approveExport();
  domain.moveSample({ sampleId: "S12", targetWellId: "D6", expectedStateVersion: 2, lockWell: true }, "human");
  assert.equal(domain.approval, null);
  assert.throws(
    () => domain.exportApproved({ layoutHash: prepared.layoutHash, idempotencyKey: "changed-layout-1" }),
    (error) => error instanceof DomainError && error.code === "layout_mismatch",
  );
});
