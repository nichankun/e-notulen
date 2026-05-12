import { Loader2, CheckCircle2, CloudOff, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EditorHeaderProps {
  title?: string;
  leader?: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

const statusConfig = {
  saving: {
    className: "bg-primary/10 text-primary border-transparent",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    label: "Menyimpan...",
  },
  saved: {
    className:
      "text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900 dark:bg-emerald-950/30",
    icon: <CheckCircle2 className="h-3 w-3" />,
    label: "Tersimpan",
  },
  error: {
    className:
      "bg-destructive/10 text-destructive border-destructive/20 animate-pulse",
    icon: <CloudOff className="h-3 w-3" />,
    label: "Gagal Simpan",
  },
  idle: {
    className: "text-muted-foreground border-border/50 bg-muted/30",
    icon: <Save className="h-3 w-3 opacity-60" />,
    label: "Standby",
  },
};

export function EditorHeader({ title, leader, saveStatus }: EditorHeaderProps) {
  const status = statusConfig[saveStatus];

  return (
    // Padding vertikal dikurangi (py-1.5) dan padding horizontal sedikit disesuaikan (px-3)
    <div className="hidden lg:flex px-3 py-1.5 border-b bg-background items-center justify-between gap-3 shrink-0">
      <div className="min-w-0 flex-1 flex items-center gap-2">
        <h3 className="font-medium text-sm text-foreground truncate max-w-[60%]">
          {title || "Judul Rapat"}
        </h3>
        <span className="text-muted-foreground text-xs opacity-50">•</span>
        <p className="text-xs text-muted-foreground truncate">
          Pim: <span className="text-foreground">{leader || "-"}</span>
        </p>
      </div>
      <Badge
        variant="outline"
        className={`shrink-0 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium h-6 ${status.className}`}
      >
        {status.icon}
        {status.label}
      </Badge>
    </div>
  );
}
