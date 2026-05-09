import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2, Plus, X } from "lucide-react";
import Image from "next/image";

interface PhotoProps {
  photos: string[];
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

export function PhotoDocumentation({
  photos,
  isUploading,
  fileInputRef,
  onUpload,
  onRemove,
}: PhotoProps) {
  return (
    <div className="p-3">
      {/* Input File (Disembunyikan) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* BODY / AREA KONTEN */}
      {photos.length === 0 ? (
        // EMPTY STATE (Tampilan saat kosong - Sangat Compact)
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer ${
            isUploading
              ? "bg-muted/50 border-border"
              : "bg-transparent border-muted-foreground/30 hover:bg-muted/40"
          }`}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin mb-2" />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground/50 mb-2" />
          )}
          <p className="text-xs font-medium text-muted-foreground">
            {isUploading ? "Mengunggah..." : "Tambah Foto"}
          </p>
        </div>
      ) : (
        // GRID FOTO (Tampilan saat ada foto - 2 Kolom khusus Sidebar)
        <div className="grid grid-cols-2 gap-2.5">
          {photos.map((url, idx) => (
            <div
              key={idx}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <Image
                src={url}
                alt={`Lampiran ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />

              {/* OVERLAY: Tombol Hapus (Muncul saat hover) */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(idx);
                  }}
                  className="h-6 w-6 rounded-md shadow-sm"
                  title="Hapus Foto"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}

          {/* TILE TAMBAH FOTO (Menyatu di dalam grid agar hemat tempat) */}
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
              isUploading
                ? "bg-muted/50 border-border"
                : "bg-transparent border-muted-foreground/30 hover:bg-muted/40"
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            ) : (
              <>
                <Plus className="h-5 w-5 text-muted-foreground/50 mb-1" />
                <span className="text-[10px] font-medium text-muted-foreground">
                  Tambah
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
