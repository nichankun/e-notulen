import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  Loader2,
  Plus,
  UploadCloud,
  X,
} from "lucide-react";
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
    <div className="border-t bg-background">
      {/* HEADER: Sticky dengan Blur */}
      <div className="px-6 py-3 bg-muted/30 border-b flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
        <h4 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <ImageIcon className="h-3.5 w-3.5 text-primary" />
          II. Dokumentasi Foto
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-8 text-xs font-semibold rounded-lg"
        >
          {isUploading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-2" />
          ) : (
            <Plus className="h-3 w-3 mr-2" />
          )}
          Tambah Foto
        </Button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={onUpload}
        />
      </div>

      <div className="p-6">
        {photos.length === 0 ? (
          /* EMPTY STATE: Upload Zone */
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="p-4 bg-muted rounded-full mb-3 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
              <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              Belum ada foto dokumentasi
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              Klik untuk mengunggah gambar (Maks. 5MB)
            </p>
          </div>
        ) : (
          /* GRID FOTO */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((url, idx) => (
              <div
                key={idx}
                className="relative group aspect-4/3 rounded-xl overflow-hidden border bg-muted shadow-sm transition-all"
              >
                <Image
                  src={url}
                  alt={`Dokumentasi ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />

                {/* OVERLAY: Action on Hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onRemove(idx)}
                    className="h-9 w-9 rounded-full shadow-2xl translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
