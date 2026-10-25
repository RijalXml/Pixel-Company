import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialTask, advanceTaskStep, abortTask } from './taskWorkflow';

test('createInitialTask initializes steps and starts at PM', () => {
  const task = createInitialTask('Buat website toko pakaian', 'high');
  assert.equal(task.priority, 'high');
  assert.equal(task.status, 'dikerjakan');
  assert.equal(task.currentAssignee, 'pm');
  assert.equal(task.currentStepIndex, 0);
  assert.equal(task.steps.length, 8);
  assert.equal(task.steps[0].status, 'in_progress');
  assert.equal(task.steps[1].status, 'pending');
});

test('advanceTaskStep progresses from PM to Researcher with handover info', () => {
  const task = createInitialTask('Buat aplikasi kalkulator cerdas');
  const result = advanceTaskStep(task, 'Rencana PM selesai dibuat', 'Prioritas tinggi');

  assert.equal(result.isComplete, false);
  assert.equal(result.isRevision, false);
  assert.notEqual(result.handover, null);
  assert.equal(result.handover?.fromRole, 'pm');
  assert.equal(result.handover?.toRole, 'researcher');
  assert.equal(result.nextTask.currentAssignee, 'researcher');
  assert.equal(result.nextTask.steps[0].status, 'completed');
  assert.equal(result.nextTask.steps[1].status, 'in_progress');
});

test('advanceTaskStep reviewer can trigger revision back to developer', () => {
  let task = createInitialTask('Desain poster digital');
  // Advance through steps up to reviewer (step 6)
  for (let i = 0; i < 6; i++) {
    const res = advanceTaskStep(task, `Output step ${i}`, 'Catatan');
    task = res.nextTask;
  }
  assert.equal(task.currentAssignee, 'reviewer');
  assert.equal(task.currentStepIndex, 6);

  // Reviewer requests REVISION
  const revisionRes = advanceTaskStep(task, 'Audit Reviewer', 'Warna kurang kontras & kode perlu diperbaiki', 'REVISION');
  assert.equal(revisionRes.isRevision, true);
  assert.equal(revisionRes.handover?.fromRole, 'reviewer');
  assert.equal(revisionRes.handover?.toRole, 'developer');
  assert.equal(revisionRes.nextTask.status, 'revisi');
  assert.equal(revisionRes.nextTask.currentAssignee, 'developer');
  assert.equal(revisionRes.nextTask.revisionCount, 1);
});

test('abortTask sets status to gagal with CEO cancellation log', () => {
  const task = createInitialTask('Tugas yang salah');
  const aborted = abortTask(task, 'Prioritas berubah');
  assert.equal(aborted.status, 'gagal');
  assert.equal(aborted.history[aborted.history.length - 1].message.includes('Tugas dihentikan oleh CEO'), true);
});
