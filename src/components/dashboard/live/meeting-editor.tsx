"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabaseClient";
import {
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
  Heading2,
  Heading3,
  CloudOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";
import Image from "next/image";

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
        class:
          "prose prose-base max-w-none focus:outline-none min-h-[400px] p-8 bg-white",
        // OPTIMASI MOBILE: Mencegah keyboard HP menyisipkan spasi ganda atau format aneh
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

        if (publicUrlData.publicUrl) {
          newPhotoUrls.push(publicUrlData.publicUrl);
        }
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
        .catch((err) => console.error("Gagal hapus file di storage:", err));
    }

    setPhotos(photos.filter((_, i) => i !== index));
    toast.info("Foto dokumentasi dihapus");
  };

  if (!editor) return null;

  return (
    <Card className="h-full flex flex-col border-slate-200 shadow-xl overflow-hidden bg-white rounded-3xl">
      {/* HEADER: Info Rapat & Status Indikator */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
        <div className="min-w-0">
          <h3 className="font-black text-lg text-slate-800 truncate tracking-tight">
            {title || "Judul Rapat"}
          </h3>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Pimpinan: {leader || "-"}
          </p>
        </div>

        {/* 🔥 STATUS INDIKATOR REAL-TIME */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-300">
          {saveStatus === "saving" && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                Menyimpan...
              </span>
            </div>
          )}
          {saveStatus === "saved" && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCheck className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                Tersimpan
              </span>
            </div>
          )}
          {saveStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600 animate-pulse">
              <CloudOff className="h-3 w-3" />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                Gagal Simpan
              </span>
            </div>
          )}
          {saveStatus === "idle" && (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                Standby
              </span>
            </div>
          )}
        </div>
      </div>

      {/* BODY: Editor & Dokumentasi */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
        <div className="p-4 bg-slate-900 text-[10px] font-black text-white uppercase tracking-[0.3em] sticky top-0 z-20">
          I. Risalah Pembahasan
        </div>

        {/* Toolbar Tiptap Editor */}
        <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md p-2 flex flex-wrap gap-1 items-center sticky top-10 z-10 shadow-sm">
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 3 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
          <div className="w-px h-6 bg-slate-200 mx-1" />
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
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <EditorContent editor={editor} />

        <div className="p-4 bg-slate-900 text-[10px] font-black text-white uppercase tracking-[0.3em] flex justify-between items-center mt-4">
          <span>II. Dokumentasi Foto</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-7 text-[9px] font-black uppercase bg-white text-slate-900 hover:bg-blue-50"
          >
            {isUploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
            Tambah Foto
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

        <div className="p-6 bg-slate-50 min-h-50">
          {photos.length === 0 ? (
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-slate-400 hover:bg-white hover:border-blue-400 transition-all cursor-pointer group"
            >
              <UploadCloud className="h-10 w-10 mb-2 group-hover:text-blue-500 transition-colors" />
              <p className="text-sm font-bold">Belum ada foto dokumentasi</p>
              <p className="text-[10px] uppercase tracking-widest mt-1">
                Klik untuk upload
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-video rounded-xl overflow-hidden border-2 border-white shadow-md bg-slate-200"
                >
                  <Image
                    src={url}
                    alt={`Dokumentasi rapat ${idx + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-2 right-2 bg-red-600/90 text-white p-1.5 rounded-lg shadow-lg z-10 transition-colors hover:bg-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER: Tombol Finalisasi */}
      <div className="p-6 border-t border-slate-100 bg-white shrink-0">
        <Button
          onClick={onFinish}
          disabled={isSaving || isUploading}
          className="w-full bg-slate-900 hover:bg-blue-700 text-white h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CheckCheck className="mr-2 h-5 w-5" />
          )}
          Finalisasi Laporan
        </Button>
      </div>
    </Card>
  );
}
