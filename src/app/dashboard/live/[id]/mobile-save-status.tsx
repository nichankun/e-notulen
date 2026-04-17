import { Loader2, CheckCheck, CloudOff } from "lucide-react";

interface MobileSaveStatusProps {
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function MobileSaveStatus({ saveStatus }: MobileSaveStatusProps) {
  return (
    <div className="flex lg:hidden items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      {saveStatus === "saving" && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0866ff]" />
      )}
      {saveStatus === "saved" && (
        <CheckCheck className="h-3.5 w-3.5 text-[#25D366]" />
      )}
      {saveStatus === "error" && (
        <CloudOff className="h-3.5 w-3.5 text-red-500" />
      )}
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {saveStatus === "saving"
          ? "Menyimpan..."
          : saveStatus === "saved"
            ? "Tersimpan"
            : "E-Notulen Live"}
      </span>
    </div>
  );
}
