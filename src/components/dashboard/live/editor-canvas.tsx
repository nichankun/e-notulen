"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import { sanitizeSummaryHtml } from "@/lib/sanitize-html";
import type { MeetingSummary } from "@/lib/meeting-summary";
import { StructuredSummary } from "./structured-summary";

type ActiveTab = "transcript" | "summary";

interface EditorCanvasProps {
  activeTab: ActiveTab;
  rawTranscript: string;
  interimTranscript?: string; // ← tambah
  summaryHtml: string;
  summaryData?: MeetingSummary | null;
  isListening: boolean;
  onTranscriptChange: (val: string) => void;
  onTabChange: (tab: ActiveTab) => void;
}

interface TranscriptSegment {
  timestamp: string;
  text: string;
}

function parseSegments(raw: string): TranscriptSegment[] {
  const lines = raw.split("\n");
  const segments: TranscriptSegment[] = [];
  let current: TranscriptSegment | null = null;

  for (const line of lines) {
    const match = line.match(/^\[(\d{2}:\d{2})\]\s*(.*)/);
    if (match) {
      if (current) segments.push(current);
      current = { timestamp: match[1], text: match[2] };
    } else if (current) {
      const trimmed = line.trim();
      if (trimmed) current.text += "\n" + trimmed;
    } else {
      if (line.trim()) {
        segments.push({ timestamp: "", text: line.trim() });
      }
    }
  }
  if (current && current.text.trim()) segments.push(current);
  return segments.filter((s) => s.text.trim());
}

const TranscriptSegmentList = memo(function TranscriptSegmentList({
  segments,
  isListening,
}: {
  segments: TranscriptSegment[];
  isListening: boolean;
}) {
  return (
    <>
      {segments.map((seg, index) => (
        <div
          key={`${seg.timestamp}-${index}`}
          className="[content-visibility:auto] [contain-intrinsic-size:auto_40px]"
        >
          {seg.timestamp && (
            <p className="text-[11px] text-muted-foreground/60 tabular-nums mb-0.5">
              {seg.timestamp}
            </p>
          )}
          <p
            className={`text-sm leading-snug whitespace-pre-wrap ${
              index === segments.length - 1 && isListening
                ? "text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {seg.text}
          </p>
        </div>
      ))}
    </>
  );
});

export function EditorCanvas({
  activeTab,
  rawTranscript,
  interimTranscript = "", // ← tambah
  summaryHtml,
  summaryData = null,
  isListening,
  onTranscriptChange,
  onTabChange,
}: EditorCanvasProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const segments = useMemo(() => parseSegments(rawTranscript), [rawTranscript]);
  const hasTimestamps = useMemo(
    () => segments.some((segment) => segment.timestamp),
    [segments],
  );
  const safeSummaryHtml = sanitizeSummaryHtml(summaryHtml);
  const hasSummary = Boolean(summaryData || safeSummaryHtml);

  // Auto-scroll juga saat interim berubah
  useEffect(() => {
    if (!isListening) return;

    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
    }
    scrollFrameRef.current = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      scrollFrameRef.current = null;
    });

    return () => {
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };
  }, [rawTranscript, interimTranscript, isListening]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden min-h-0">
      {hasSummary && (
        <div className="flex border-b px-4 shrink-0">
          <button
            onClick={() => onTabChange("transcript")}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "transcript"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Transkrip
          </button>
          <button
            onClick={() => onTabChange("summary")}
            className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "summary"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Rangkuman AI
          </button>
        </div>
      )}

      {activeTab === "transcript" && (
        <div className="flex-1 overflow-y-auto px-5 pt-3 min-h-0">
          {rawTranscript || interimTranscript ? (
            hasTimestamps ? (
              <div className="space-y-3">
                <TranscriptSegmentList
                  segments={segments}
                  isListening={isListening}
                />

                {/* Interim: teks sementara yang sedang diproses Deepgram */}
                {interimTranscript && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground/60">
                      Sementara · bisa berubah
                    </p>
                    <p className="text-sm leading-snug text-muted-foreground/70 italic">
                      {interimTranscript}
                    </p>
                  </div>
                )}

                {/* Dot animasi hanya tampil saat listening tapi tidak ada interim */}
                {isListening && !interimTranscript && (
                  <div className="flex items-center gap-1 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse [animation-delay:300ms]" />
                  </div>
                )}

                <div className="h-48 lg:h-6 shrink-0 pointer-events-none" />
                <div ref={bottomRef} />
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <textarea
                  value={rawTranscript}
                  onChange={(e) => onTranscriptChange(e.target.value)}
                  disabled={isListening}
                  className={`w-full flex-1 min-h-80 text-sm leading-snug bg-transparent border-none outline-none resize-none text-foreground pb-48 lg:pb-6 ${
                    isListening ? "cursor-not-allowed opacity-60" : ""
                  }`}
                />
                {interimTranscript && (
                  <div className="shrink-0 pb-48 lg:pb-6 space-y-1">
                    <p className="text-[10px] text-muted-foreground/60">
                      Sementara · bisa berubah
                    </p>
                    <p className="text-sm leading-snug text-muted-foreground/70 italic">
                      {interimTranscript}
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            <p className="text-sm text-muted-foreground text-center mt-10">
              Tekan <strong className="text-red-500">Rekam Suara</strong> untuk
              mulai mencatat...
            </p>
          )}
        </div>
      )}

      {activeTab === "summary" && summaryData && (
        <div className="flex-1 overflow-y-auto px-5 pt-3 pb-48 lg:pb-6 min-h-0">
          <StructuredSummary summary={summaryData} />
        </div>
      )}

      {activeTab === "summary" && !summaryData && safeSummaryHtml && (
        <div className="flex-1 overflow-y-auto px-5 pt-3 pb-48 lg:pb-6 min-h-0">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-0.5"
            dangerouslySetInnerHTML={{ __html: safeSummaryHtml }}
          />
        </div>
      )}
    </div>
  );
}
