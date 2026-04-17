"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

// Import komponen pendukung
import { EditorHeader } from "./editor-header";
import { EditorToolbar } from "./editor-toolbar";
import { PhotoDocumentation } from "./photo-documentation";
import { EditorFooter } from "./editor-footer";

interface MeetingEditorProps {
  title?: string;
  leader?: string;
  content: string;
  setContent: (val: string) => void;
  photos: string[];
  setPhotos: (val: string[]) => void;
  onFinish: () => void;
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function MeetingEditor({
  title,
  leader,
  content,
  setContent,
  photos = [],
  setPhotos,
  onFinish,
  isSaving,
  saveStatus,
}: MeetingEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        // PERBAIKAN 1: Merapikan tipografi agar lebih elegan dan responsif terhadap tema shadcn
        class: [
          "max-w-none focus:outline-none min-h-[400px] p-6 md:p-10 lg:p-12 bg-transparent text-foreground",
          "[&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:tracking-tight",
          "[&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:tracking-tight",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-2 [&_ul]:mb-6",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mt-2 [&_ol]:mb-6",
          "[&_li]:my-2",
          "[&_li>p]:m-0",
          "[&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-[15px] md:text-base",
          "[&_strong]:font-bold [&_em]:italic",
        ].join(" "),
        spellcheck: "false",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newPhotoUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const options = {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

        const { error } = await supabase.storage
          .from("notulen")
          .upload(fileName, compressedFile);
        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from("notulen")
          .getPublicUrl(fileName);
        if (publicUrlData.publicUrl) newPhotoUrls.push(publicUrlData.publicUrl);
      }
      setPhotos([...photos, ...newPhotoUrls]);
      toast.success(`${newPhotoUrls.length} Foto berhasil diunggah`);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Gagal mengunggah foto");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = async (index: number) => {
    const urlToDelete = photos[index];
    const fileName = urlToDelete.split("/").pop();
    if (fileName) {
      supabase.storage
        .from("notulen")
        .remove([fileName])
        .catch((err) => console.error(err));
    }
    setPhotos(photos.filter((_, i) => i !== index));
    toast.info("Foto dokumentasi dihapus");
  };

  if (!editor) return null;

  return (
    // PERBAIKAN 2: Container utama menggunakan flex-1 agar memenuhi layar dan shadow yang lebih lembut
    <Card className="h-full flex flex-col bg-card border shadow-md overflow-hidden flex-1">
      <EditorHeader title={title} leader={leader} saveStatus={saveStatus} />

      {/* PERBAIKAN 3: Scrollbar menggunakan warna muted semantik shadcn */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 bg-background">
        <div className="relative">
          {/* PERBAIKAN 4: Sub-header disamakan gayanya dengan PhotoDocumentation agar konsisten */}
          <div className="px-6 py-3 bg-muted/30 border-b flex items-center sticky top-0 z-20 backdrop-blur-md">
            <h4 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
              I. Risalah Pembahasan
            </h4>
          </div>

          <EditorToolbar editor={editor} />

          <div className="max-w-4xl mx-auto">
            <EditorContent editor={editor} />
          </div>
        </div>

        <PhotoDocumentation
          photos={photos}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          onUpload={handlePhotoUpload}
          onRemove={removePhoto}
        />
      </div>

      <EditorFooter
        isSaving={isSaving}
        isUploading={isUploading}
        onFinish={onFinish}
      />
    </Card>
  );
}
