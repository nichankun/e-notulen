import { type Editor } from "@tiptap/react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import {
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    // PERBAIKAN 1: Menghapus shadow-sm dari container utama karena border-b sudah cukup memberikan batas yang tegas (lebih clean).
    // Catatan: Jika top-10 membuat jarak kosong yang aneh, ubah menjadi top-0. Saya biarkan top-10 jika Anda memang punya header statis di atasnya.
    <div className="border-b bg-background/95 backdrop-blur-md p-2 flex gap-1.5 items-center sticky top-10 z-10 px-4 md:px-6 overflow-x-auto w-full scrollbar-none">
      {/* GRUP 1: Heading */}
      {/* PERBAIKAN 2: Menggunakan bg-muted (tanpa /30) dan border agar kontrasnya lebih terlihat ala segmented control shadcn */}
      <div className="flex items-center gap-0.5 bg-muted p-1 rounded-lg border border-border/50 shrink-0">
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all rounded-md h-8 px-2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all rounded-md h-8 px-2"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="w-px h-5 bg-border mx-1 shrink-0" />

      {/* GRUP 2: Format Teks */}
      <div className="flex items-center gap-0.5 bg-muted p-1 rounded-lg border border-border/50 shrink-0">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all rounded-md h-8 px-2"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all rounded-md h-8 px-2"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="w-px h-5 bg-border mx-1 shrink-0" />

      {/* GRUP 3: List */}
      <div className="flex items-center gap-0.5 bg-muted p-1 rounded-lg border border-border/50 shrink-0">
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all rounded-md h-8 px-2"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          className="data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm transition-all rounded-md h-8 px-2"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>

      {/* PERBAIKAN 3: Menghapus class min-w-5 yang tidak valid. Cukup gunakan flex-1. */}
      <div className="flex-1" />

      {/* GRUP 4: Undo & Redo */}
      <div className="flex gap-1 shrink-0">
        {/* Menggunakan text-muted-foreground bawaan, tombol akan ter-disable secara otomatis oleh Tiptap jika state tidak valid */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
