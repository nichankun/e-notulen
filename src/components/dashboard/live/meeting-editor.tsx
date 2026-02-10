"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabaseClient";
import {
  Save,
  Loader2,
  CheckCheck,
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  X,
  Plus,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner"; // Pakai sonner

interface MeetingEditorProps {
  title?: string;
  leader?: string;
  content: string;
  setContent: (val: string) => void;
  photos: string[];
  setPhotos: (val: string[]) => void;
  onSaveDraft: () => void;
  onFinish: () => void;
  isSaving: boolean;
}

export function MeetingEditor({
  title,
  leader,
  content,
  setContent,
  photos = [],
  setPhotos,
  onSaveDraft,
  onFinish,
  isSaving,
}: MeetingEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-4 md:p-6",
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

    try {
      const newPhotoUrls: string[] = [];

      for (const file of Array.from(files)) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8,
        };

        const compressedFile = await imageCompression(file, options);
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;

        const { error } = await supabase.storage
          .from("notulen")
          .upload(fileName, compressedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Upload error:", error);
          toast.error(`Gagal upload ${file.name}`);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("notulen")
          .getPublicUrl(fileName);

        if (publicUrlData.publicUrl) {
          newPhotoUrls.push(publicUrlData.publicUrl);
        }
      }

      setPhotos([...photos, ...newPhotoUrls]);
      toast.success("Foto berhasil diunggah");
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Gagal memproses gambar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  if (!editor) return null;

  return (
    <Card className="h-full flex flex-col border-slate-200 shadow-sm overflow-hidden bg-white">
      {/* HEADER */}
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center shrink-0">
        <div className="min-w-0">
          <h3 className="font-bold text-base md:text-lg text-slate-800 truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-500 truncate">Pimpinan: {leader}</p>
        </div>
        <Button
          onClick={onSaveDraft}
          variant="ghost"
          size="icon"
          disabled={isSaving || isUploading}
          className="shrink-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 ml-2"
        >
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
        </Button>
      </div>

      {/* BODY SCROLLABLE */}
      <div className="flex-1 overflow-y-auto">
        {/* SECTION I: RISALAH */}
        <div className="p-3 md:p-4 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-20">
          I. Risalah Pembahasan
        </div>

        {/* Toolbar Teks (Sticky) */}
        <div className="border-b border-slate-100 bg-white p-2 flex flex-wrap gap-1 items-center sticky top-10 z-10 shadow-sm">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <EditorContent
          editor={editor}
          className="min-h-50 cursor-text bg-white"
        />

        {/* SECTION III: DOKUMENTASI */}
        <div className="p-3 md:p-4 bg-slate-100 border-y border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center mt-4">
          <span>III. Dokumentasi Foto</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-7 text-xs bg-white px-2"
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Plus className="h-3 w-3 mr-1" />
            )}
            {isUploading ? "Upload..." : "Tambah"}
          </Button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </div>

        <div className="p-4 md:p-6 bg-slate-50 min-h-37.5">
          {photos.length === 0 ? (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-slate-300 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center text-slate-400 transition-colors ${isUploading ? "cursor-wait opacity-50" : "cursor-pointer hover:bg-slate-100 hover:border-slate-400"}`}
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 md:h-10 md:w-10 mb-2 animate-spin text-blue-500" />
              ) : (
                <UploadCloud className="h-8 w-8 md:h-10 md:w-10 mb-2" />
              )}
              <p className="text-sm font-medium text-center">
                {isUploading ? "Mengupload..." : "Klik upload foto"}
              </p>
              <p className="text-[10px] md:text-xs mt-1 text-center">
                Otomatis kompres HD (Max 1MB)
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Dokumentasi ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Tombol Add More Grid */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg aspect-video text-slate-400 hover:bg-slate-100 hover:border-slate-400 transition-colors disabled:opacity-50 bg-white"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5 md:h-6 md:w-6" />
                )}
                <span className="text-[10px] md:text-xs font-bold mt-1">
                  Tambah
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER - Sticky Bottom */}
      <div className="p-4 md:p-6 border-t border-slate-100 bg-white flex justify-end shrink-0">
        <Button
          onClick={onFinish}
          disabled={isSaving || isUploading}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 h-10 md:h-12 rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-70"
        >
          {isSaving || isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCheck className="mr-2 h-5 w-5" /> Finalisasi
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
