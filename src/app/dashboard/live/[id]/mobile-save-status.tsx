"use client";

import { Loader2, CheckCheck, CloudOff, Save } from "lucide-react";

interface MobileSaveStatusProps {
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function MobileSaveStatus({ saveStatus }: MobileSaveStatusProps) {
  return (
    <div className="flex lg:hidden items-center gap-2 px-3 py-1.5 rounded-full bg-background border shadow-sm transition-all duration-300">
      {saveStatus === "saving" && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
      )}

      {saveStatus === "saved" && (
        <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
      )}

      {saveStatus === "error" && (
        <CloudOff className="h-3.5 w-3.5 text-destructive animate-pulse" />
      )}

      {saveStatus === "idle" && (
        <Save className="h-3.5 w-3.5 text-muted-foreground/60" />
      )}

      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-px">
        {saveStatus === "saving" && "Menyimpan"}
        {saveStatus === "saved" && "Tersimpan"}
        {saveStatus === "error" && "Gagal"}
        {saveStatus === "idle" && "Standby"}
      </span>
    </div>
  );
}
