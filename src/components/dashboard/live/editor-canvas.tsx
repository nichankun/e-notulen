"use client";

import { useEffect, useRef } from "react";

type ActiveTab = "transcript" | "summary";

interface EditorCanvasProps {
  activeTab: ActiveTab;
  rawTranscript: string;
  summaryHtml: string;
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

export function EditorCanvas({
  activeTab,
  rawTranscript,
  summaryHtml,
  isListening,
  onTranscriptChange,
  onTabChange,
}: EditorCanvasProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const segments = parseSegments(rawTranscript);
  const hasTimestamps = segments.some((s) => s.timestamp);

  useEffect(() => {
    if (isListening) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [rawTranscript, isListening]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden min-h-0">
      {summaryHtml && (
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
          {rawTranscript ? (
            hasTimestamps ? (
              <div className="space-y-3">
                {segments.map((seg, i) => (
                  <div key={i}>
                    {seg.timestamp && (
                      <p className="text-[11px] text-muted-foreground/60 tabular-nums mb-0.5">
                        {seg.timestamp}
                      </p>
                    )}
                    <p
                      className={`text-sm leading-snug whitespace-pre-wrap ${
                        i === segments.length - 1 && isListening
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {seg.text}
                    </p>
                  </div>
                ))}

                {isListening && (
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
              <textarea
                value={rawTranscript}
                onChange={(e) => onTranscriptChange(e.target.value)}
                disabled={isListening}
                className={`w-full h-full min-h-80 text-sm leading-snug bg-transparent border-none outline-none resize-none text-foreground pb-48 lg:pb-6 ${
                  isListening ? "cursor-not-allowed opacity-60" : ""
                }`}
              />
            )
          ) : (
            <p className="text-sm text-muted-foreground text-center mt-10">
              Tekan <strong className="text-red-500">Rekam Suara</strong> untuk
              mulai mencatat...
            </p>
          )}
        </div>
      )}

      {activeTab === "summary" && summaryHtml && (
        <div className="flex-1 overflow-y-auto px-5 pt-3 pb-48 lg:pb-6 min-h-0">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-0.5"
            dangerouslySetInnerHTML={{ __html: summaryHtml }}
          />
        </div>
      )}
    </div>
  );
}
