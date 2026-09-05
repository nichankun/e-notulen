export type SummaryConfidence = "high" | "medium" | "low";

export type DecisionStatus = "confirmed" | "proposed" | "unclear";

export type ActionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "unclear";

export interface SummaryEvidence {
  timestamp: string | null;
  quote: string;
}

export interface SummaryDiscussion {
  point: string;
  evidence: SummaryEvidence[];
  confidence: SummaryConfidence;
  verificationRequired: boolean;
}

export interface SummaryDecision {
  decision: string;
  status: DecisionStatus;
  evidence: SummaryEvidence[];
  confidence: SummaryConfidence;
  verificationRequired: boolean;
}

export interface SummaryActionItem {
  task: string;
  pic: string | null;
  deadline: string | null;
  status: ActionStatus;
  evidence: SummaryEvidence[];
  confidence: SummaryConfidence;
  verificationRequired: boolean;
}

export interface MeetingSummary {
  version: 1;
  overview: string;
  discussion: SummaryDiscussion[];
  decisions: SummaryDecision[];
  actionItems: SummaryActionItem[];
  verificationItems: string[];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderEvidence(evidence: SummaryEvidence[]): string {
  if (evidence.length === 0) return "";

  return `<ul>${evidence
    .map(
      (item) =>
        `<li>${item.timestamp ? `<strong>${escapeHtml(item.timestamp)}</strong> — ` : ""}${escapeHtml(item.quote)}</li>`,
    )
    .join("")}</ul>`;
}

function verificationLabel(required: boolean): string {
  return required ? ` <strong>[Perlu verifikasi]</strong>` : "";
}

function confidenceLabel(confidence: SummaryConfidence): string {
  return confidence === "high"
    ? "Keyakinan tinggi"
    : confidence === "medium"
      ? "Keyakinan sedang"
      : "Keyakinan rendah";
}

function decisionStatusLabel(status: DecisionStatus): string {
  return status === "confirmed"
    ? "Disepakati"
    : status === "proposed"
      ? "Usulan"
      : "Belum jelas";
}

function actionStatusLabel(status: ActionStatus): string {
  return status === "not_started"
    ? "Belum dimulai"
    : status === "in_progress"
      ? "Sedang berjalan"
      : status === "completed"
        ? "Selesai"
        : "Belum jelas";
}

/**
 * Deterministic HTML renderer used for backward compatibility and PDF export.
 * The source of truth remains the validated structured JSON object.
 */
export function summaryToHtml(summary: MeetingSummary): string {
  const sections: string[] = [];

  if (summary.overview.trim()) {
    sections.push(
      `<h3>Ringkasan</h3><p>${escapeHtml(summary.overview)}</p>`,
    );
  }

  if (summary.discussion.length > 0) {
    sections.push(
      `<h3>Pembahasan</h3><ul>${summary.discussion
        .map(
          (item) =>
            `<li><strong>${escapeHtml(confidenceLabel(item.confidence))}</strong>: ${escapeHtml(item.point)}${verificationLabel(item.verificationRequired)}${renderEvidence(item.evidence)}</li>`,
        )
        .join("")}</ul>`,
    );
  }

  if (summary.decisions.length > 0) {
    sections.push(
      `<h3>Keputusan</h3><ol>${summary.decisions
        .map(
          (item) =>
            `<li><strong>${escapeHtml(decisionStatusLabel(item.status))}</strong>: ${escapeHtml(item.decision)} — ${escapeHtml(confidenceLabel(item.confidence))}${verificationLabel(item.verificationRequired)}${renderEvidence(item.evidence)}</li>`,
        )
        .join("")}</ol>`,
    );
  }

  if (summary.actionItems.length > 0) {
    sections.push(
      `<h3>Tindak Lanjut</h3><ul>${summary.actionItems
        .map(
          (item) =>
            `<li><strong>${escapeHtml(item.task)}</strong> — PIC: ${escapeHtml(item.pic || "Belum ditentukan")}; Tenggat: ${escapeHtml(item.deadline || "Belum ditentukan")}; Status: ${escapeHtml(actionStatusLabel(item.status))}; ${escapeHtml(confidenceLabel(item.confidence))}${verificationLabel(item.verificationRequired)}${renderEvidence(item.evidence)}</li>`,
        )
        .join("")}</ul>`,
    );
  }

  if (summary.verificationItems.length > 0) {
    sections.push(
      `<h3>Perlu Verifikasi</h3><ul>${summary.verificationItems
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul>`,
    );
  }

  return sections.join("") || "<p>Belum ada ringkasan yang dapat disusun.</p>";
}
