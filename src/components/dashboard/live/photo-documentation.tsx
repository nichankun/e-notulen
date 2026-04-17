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
    <div className="border-t">
      <div className="px-6 py-3 bg-muted/20 border-b flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          II. Dokumentasi Foto
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-8 text-xs font-medium"
        >
          {isUploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <Plus className="h-3.5 w-3.5 mr-1.5" />
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
          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group bg-background"
          >
            <div className="p-3 bg-muted rounded-full mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Belum ada foto dokumentasi
            </p>
            <p className="text-xs mt-1">Klik di sini untuk mengunggah gambar</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((url, idx) => (
              <div
                key={idx}
                className="relative group aspect-4/3 rounded-lg overflow-hidden border bg-muted shadow-sm"
              >
                <Image
                  src={url}
                  alt={`Dokumentasi ${idx + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onRemove(idx)}
                    className="h-8 w-8 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform"
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
