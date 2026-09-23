import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node's native test runner resolves explicit .ts ESM imports.
import { canTransitionMeetingStatus, isFinalizedMeetingStatus } from "../src/lib/meeting-status.ts";

test("archived dan completed sama-sama status final", () => {
  assert.equal(isFinalizedMeetingStatus("archived"), true);
  assert.equal(isFinalizedMeetingStatus("completed"), true);
  assert.equal(isFinalizedMeetingStatus("live"), false);
  assert.equal(isFinalizedMeetingStatus(null), false);
});

test("transisi status mempertahankan alur draft/live dan menutup status final", () => {
  assert.equal(canTransitionMeetingStatus("draft", "live"), true);
  assert.equal(canTransitionMeetingStatus("draft", "completed"), true);
  assert.equal(canTransitionMeetingStatus("live", "archived"), true);
  assert.equal(canTransitionMeetingStatus("completed", "archived"), false);
  assert.equal(canTransitionMeetingStatus("archived", "live"), false);
});
