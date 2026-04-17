import { Loader2, CheckCheck, CloudOff } from "lucide-react";

interface EditorHeaderProps {
  title?: string;
  leader?: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function EditorHeader({ title, leader, saveStatus }: EditorHeaderProps) {
  return (
    <div className="px-6 py-5 border-b bg-muted/30 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4 shrink-0">
      <div className="min-w-0 space-y-1">
        <h3 className="font-semibold text-xl text-foreground tracking-tight line-clamp-1">
          {title || "Judul Rapat"}
        </h3>
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          Pimpinan: <span className="text-foreground">{leader || "-"}</span>
        </p>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border shadow-sm text-sm font-medium transition-all duration-300">
        {saveStatus === "saving" && (
          <div className="flex items-center gap-2 text-blue-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Menyimpan...</span>
          </div>
        )}
        {saveStatus === "saved" && (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Tersimpan</span>
          </div>
        )}
        {saveStatus === "error" && (
          <div className="flex items-center gap-2 text-destructive animate-pulse">
            <CloudOff className="h-3.5 w-3.5" />
            <span>Gagal Simpan</span>
          </div>
        )}
        {saveStatus === "idle" && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span>Standby</span>
          </div>
        )}
      </div>
    </div>
  );
}
