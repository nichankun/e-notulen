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
  // PERBAIKAN 1: Gabungkan status proses agar lebih mudah dikelola
  const isProcessing = isSaving || isUploading;

  return (
    // PERBAIKAN 2: Pindahkan logika tata letak (alignment) ke parent container.
    // Menggunakan bg-background agar menyatu dengan layar utama.
    <div className="p-4 md:p-6 border-t bg-background shrink-0 flex flex-col sm:flex-row justify-end items-center">
      <Button
        size="lg"
        onClick={onFinish}
        disabled={isProcessing}
        // PERBAIKAN 3: Hapus class manual seperti rounded-lg, font-semibold, shadow-sm, dan sm:ml-auto.
        // Komponen <Button> shadcn sudah mengatur font, shadow, dan radius secara otomatis dari tema!
        className="w-full sm:w-auto transition-all"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {/* Teks dinamis agar pengguna tahu apa yang sedang ditunggu */}
            {isUploading ? "Mengunggah Foto..." : "Menyimpan Data..."}
          </>
        ) : (
          <>
            <CheckCheck className="mr-2 h-4 w-4" />
            Finalisasi Laporan
          </>
        )}
      </Button>
    </div>
  );
}
