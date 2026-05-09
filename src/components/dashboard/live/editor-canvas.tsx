// components/dashboard/live/editor-canvas.tsx

type ActiveTab = "transcript" | "summary";

interface EditorCanvasProps {
  activeTab: ActiveTab;
  rawTranscript: string;
  summaryHtml: string;
  isListening: boolean;
  onTranscriptChange: (val: string) => void;
  onTabChange: (tab: ActiveTab) => void;
}

export function EditorCanvas({
  activeTab,
  rawTranscript,
  summaryHtml,
  isListening,
  onTranscriptChange,
  onTabChange,
}: EditorCanvasProps) {
  return (
    <>
      {summaryHtml && (
        <div className="flex border-b px-4">
          <button
            onClick={() => onTabChange("transcript")}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "transcript"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Transkrip
          </button>
          <button
            onClick={() => onTabChange("summary")}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
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
        <div className="flex-1 overflow-hidden px-6 py-5">
          {rawTranscript ? (
            <textarea
              value={rawTranscript}
              onChange={(e) => onTranscriptChange(e.target.value)}
              disabled={isListening}
              className={`w-full h-full min-h-96 text-sm leading-relaxed bg-transparent border-none outline-none resize-none text-foreground overflow-y-auto ${
                isListening ? "cursor-not-allowed opacity-60" : ""
              }`}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Tekan <strong className="text-red-500">Rekam Suara</strong> untuk
              mulai mencatat...
            </p>
          )}
        </div>
      )}

      {activeTab === "summary" && summaryHtml && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-foreground [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: summaryHtml }}
          />
        </div>
      )}
    </>
  );
}
