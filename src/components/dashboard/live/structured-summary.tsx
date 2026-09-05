"use client";

import { AlertTriangle, CheckCircle2, Clock3, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  MeetingSummary,
  SummaryConfidence,
  SummaryEvidence,
} from "@/lib/meeting-summary";

const confidenceLabel: Record<SummaryConfidence, string> = {
  high: "Keyakinan tinggi",
  medium: "Keyakinan sedang",
  low: "Keyakinan rendah",
};

const confidenceClass: Record<SummaryConfidence, string> = {
  high: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-red-200 bg-red-50 text-red-700",
};

const decisionStatusLabel = {
  confirmed: "Disepakati",
  proposed: "Usulan",
  unclear: "Belum jelas",
} as const;

const actionStatusLabel = {
  not_started: "Belum dimulai",
  in_progress: "Sedang berjalan",
  completed: "Selesai",
  unclear: "Belum jelas",
} as const;

function ConfidenceBadge({ confidence }: { confidence: SummaryConfidence }) {
  return (
    <Badge variant="outline" className={confidenceClass[confidence]}>
      {confidenceLabel[confidence]}
    </Badge>
  );
}

function EvidenceList({ evidence }: { evidence: SummaryEvidence[] }) {
  if (evidence.length === 0) {
    return (
      <p className="text-xs text-amber-700">
        Bukti waktu belum tersedia. Perlu verifikasi dari transkrip.
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Bukti dari transkrip
      </p>
      {evidence.map((item, index) => (
        <blockquote
          key={`${item.timestamp ?? "tanpa-waktu"}-${index}`}
          className="rounded-md border-l-2 border-indigo-300 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground"
        >
          {item.timestamp && (
            <span className="mr-1.5 font-semibold tabular-nums text-indigo-600">
              {item.timestamp.startsWith("[") ? item.timestamp : `[${item.timestamp}]`}
            </span>
          )}
          “{item.quote}”
        </blockquote>
      ))}
    </div>
  );
}

function VerificationBadge() {
  return (
    <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
      Perlu verifikasi
    </Badge>
  );
}

export function StructuredSummary({ summary }: { summary: MeetingSummary }) {
  return (
    <div className="space-y-5 pb-8 text-sm">
      <section className="rounded-lg border bg-card p-4 shadow-sm">
        <h3 className="mb-2 font-semibold">Ringkasan rapat</h3>
        <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
          {summary.overview || "Belum ada ringkasan."}
        </p>
      </section>

      <section>
        <h3 className="mb-2 font-semibold">Pembahasan</h3>
        {summary.discussion.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tidak ada pembahasan yang terdeteksi.</p>
        ) : (
          <div className="space-y-3">
            {summary.discussion.map((item, index) => (
              <article key={`${item.point}-${index}`} className="rounded-lg border bg-card p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="flex-1 leading-relaxed">{item.point}</p>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <ConfidenceBadge confidence={item.confidence} />
                    {item.verificationRequired && <VerificationBadge />}
                  </div>
                </div>
                <EvidenceList evidence={item.evidence} />
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-1.5 font-semibold">
          <CheckCircle2 className="h-4 w-4 text-indigo-500" />
          Keputusan
        </h3>
        {summary.decisions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada keputusan yang terdeteksi.</p>
        ) : (
          <div className="space-y-3">
            {summary.decisions.map((item, index) => (
              <article key={`${item.decision}-${index}`} className="rounded-lg border bg-card p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="flex-1 leading-relaxed">{item.decision}</p>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <Badge variant="outline">{decisionStatusLabel[item.status]}</Badge>
                    <ConfidenceBadge confidence={item.confidence} />
                    {item.verificationRequired && <VerificationBadge />}
                  </div>
                </div>
                <EvidenceList evidence={item.evidence} />
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-1.5 font-semibold">
          <Clock3 className="h-4 w-4 text-indigo-500" />
          Tindak lanjut
        </h3>
        {summary.actionItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada tindak lanjut yang terdeteksi.</p>
        ) : (
          <div className="space-y-3">
            {summary.actionItems.map((item, index) => (
              <article key={`${item.task}-${index}`} className="rounded-lg border bg-card p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="flex-1 leading-relaxed">{item.task}</p>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <Badge variant="outline">{actionStatusLabel[item.status]}</Badge>
                    <ConfidenceBadge confidence={item.confidence} />
                    {item.verificationRequired && <VerificationBadge />}
                  </div>
                </div>
                <div className="mt-3 grid gap-2 border-t pt-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <span className="flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5" />
                    PIC: {item.pic || "Belum ditentukan"}
                  </span>
                  <span>Deadline: {item.deadline || "Belum ditentukan"}</span>
                  <span>Status: {actionStatusLabel[item.status]}</span>
                </div>
                <EvidenceList evidence={item.evidence} />
              </article>
            ))}
          </div>
        )}
      </section>

      {summary.verificationItems.length > 0 && (
        <section className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-amber-950">
          <h3 className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Wajib diverifikasi sebelum disahkan
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {summary.verificationItems.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-muted-foreground">
        Rangkuman dibuat dari transkrip oleh AI. Periksa bukti waktu dan tandai koreksi sebelum notula disahkan.
      </p>
    </div>
  );
}
