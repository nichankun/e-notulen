import assert from "node:assert/strict";
import test from "node:test";

// @ts-expect-error Node's native test runner resolves explicit .ts ESM imports.
import { meetingSummarySchema } from "../src/lib/meeting-summary-schema.ts";
// @ts-expect-error Node's native test runner resolves explicit .ts ESM imports.
import { summaryToHtml, type MeetingSummary } from "../src/lib/meeting-summary.ts";

const validSummary: MeetingSummary = {
  version: 1,
  overview: "Rapat membahas target penerimaan daerah.",
  discussion: [
    {
      point: "Target penerimaan perlu dipantau setiap bulan.",
      evidence: [{ timestamp: "[00:42]", quote: "Dipantau setiap bulan." }],
      confidence: "high",
      verificationRequired: false,
    },
  ],
  decisions: [
    {
      decision: "Laporan dikirim setiap tanggal lima.",
      status: "confirmed",
      evidence: [{ timestamp: "[02:10]", quote: "Kita sepakati tanggal lima." }],
      confidence: "high",
      verificationRequired: false,
    },
  ],
  actionItems: [
    {
      task: "Menyiapkan laporan bulanan.",
      pic: "Kepala Subbagian",
      deadline: "Tanggal 5 setiap bulan",
      status: "not_started",
      evidence: [{ timestamp: "[02:22]", quote: "Siapkan laporan bulanan." }],
      confidence: "medium",
      verificationRequired: true,
    },
  ],
  verificationItems: ["PIC perlu dikonfirmasi."],
};

test("meeting summary mengikuti kontrak data wajib", () => {
  const parsed = meetingSummarySchema.safeParse(validSummary);

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.decisions[0]?.evidence[0]?.timestamp, "[02:10]");
    assert.equal(parsed.data.actionItems[0]?.pic, "Kepala Subbagian");
  }
});

test("meeting summary menolak tindak lanjut tanpa field wajib", () => {
  const invalid = {
    ...validSummary,
    actionItems: validSummary.actionItems.map((item) => ({
      ...item,
      status: undefined,
    })),
  };

  assert.equal(meetingSummarySchema.safeParse(invalid).success, false);
});

test("renderer HTML meng-escape data dan mempertahankan audit evidence", () => {
  const html = summaryToHtml({
    ...validSummary,
    overview: '<script>alert("xss")</script>',
  });

  assert.equal(html.includes("<script>"), false);
  assert.equal(html.includes("&lt;script&gt;"), true);
  assert.equal(html.includes("[02:10]"), true);
  assert.equal(html.includes("PIC: Kepala Subbagian"), true);
  assert.equal(html.includes("[Perlu verifikasi]"), true);
});
