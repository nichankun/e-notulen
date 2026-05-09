import { Loader2, CheckCircle2, CloudOff, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditorHeaderProps {
  title?: string;
  leader?: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function EditorHeader({ title, leader, saveStatus }: EditorHeaderProps) {
  return (
    <div className="px-6 py-4 border-b bg-background flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
      <div className="min-w-0 space-y-1">
        <h3 className="font-semibold text-lg text-foreground truncate">
          {title || "Judul Rapat"}
        </h3>
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          Pimpinan: <span className="text-foreground">{leader || "-"}</span>
        </p>
      </div>

      {/* Bagian Status Saving menggunakan Badge agar lebih konsisten dan rapi */}
      <div className="flex items-center shrink-0">
        {saveStatus === "saving" && (
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/10 border-transparent"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="font-medium text-xs">Menyimpan...</span>
          </Badge>
        )}
        {saveStatus === "saved" && (
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-medium text-xs">Tersimpan</span>
          </Badge>
        )}
        {saveStatus === "error" && (
          <Badge
            variant="destructive"
            className="flex items-center gap-1.5 px-3 py-1.5 animate-pulse"
          >
            <CloudOff className="h-3.5 w-3.5" />
            <span className="font-medium text-xs">Gagal Simpan</span>
          </Badge>
        )}
        {saveStatus === "idle" && (
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground border-border/50 bg-muted/30"
          >
            <Save className="h-3.5 w-3.5 opacity-70" />
            <span className="font-medium text-xs">Standby</span>
          </Badge>
        )}
      </div>
    </div>
  );
}
