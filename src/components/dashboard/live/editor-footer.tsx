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
  const isProcessing = isSaving || isUploading;

  return (
    <div className="p-4 md:p-6 border-t bg-background shrink-0 flex flex-col sm:flex-row justify-end items-center gap-4">
      <Button
        size="lg"
        onClick={onFinish}
        disabled={isProcessing}
        className="w-full sm:w-auto shadow-sm"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isSaving ? "Menyimpan..." : "Mengunggah..."}
          </>
        ) : (
          <>
            <CheckCheck className="mr-2 h-4 w-4" />
            Selesai Rapat
          </>
        )}
      </Button>
    </div>
  );
}
