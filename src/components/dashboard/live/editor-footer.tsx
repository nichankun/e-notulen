import { Button } from "@/components/ui/button";
import { Loader2, CheckCheck } from "lucide-react";

interface EditorFooterProps {
  isSaving: boolean;
  isUploading: boolean;
  onFinish: () => void;
}

export function EditorFooter({
  isSaving,
  isUploading,
  onFinish,
}: EditorFooterProps) {
  return (
    <div className="p-6 border-t bg-muted/10 shrink-0">
      <Button
        size="lg"
        onClick={onFinish}
        disabled={isSaving || isUploading}
        className="w-full sm:w-auto sm:ml-auto flex rounded-lg font-semibold shadow-sm transition-all"
      >
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCheck className="mr-2 h-4 w-4" />
        )}
        Finalisasi Laporan
      </Button>
    </div>
  );
}
