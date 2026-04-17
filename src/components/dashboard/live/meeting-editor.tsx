"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

// Import komponen yang sudah dipisah ke file lain
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
        class: [
          "max-w-none focus:outline-none min-h-[250px] sm:min-h-[400px] p-4 sm:p-6 lg:p-8 bg-transparent text-foreground",
          "[&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3",
          "[&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-2 [&_ul]:mb-6",
          "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mt-2 [&_ol]:mb-6",
          "[&_li]:my-1.5",
          "[&_li>p]:m-0",
          "[&_p]:leading-relaxed [&_p]:mb-4",
          "[&_strong]:font-bold [&_em]:italic",
        ].join(" "),
        spellcheck: "false",
        autocorrect: "off",
        autocapitalize: "sentences",
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
      toast.error("Gagal mengunggah foto ke storage");
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
    <Card className="h-full flex flex-col bg-card border-border shadow-sm overflow-hidden flex-1">
      <EditorHeader title={title} leader={leader} saveStatus={saveStatus} />

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 bg-background">
        <div className="relative">
          <div className="px-6 py-3 bg-muted/20 border-b flex items-center sticky top-0 z-20 backdrop-blur-md">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
