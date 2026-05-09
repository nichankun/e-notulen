import { type Editor } from "@tiptap/react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    <div className="border-b bg-background/95 backdrop-blur-md p-1.5 flex flex-wrap gap-1.5 items-center sticky top-0 z-10 px-4 md:px-6 w-full">
      {/* GRUP 1: Heading */}
      <div className="flex items-center bg-muted/50 p-0.5 rounded-md border border-border/50">
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className="h-8 px-2.5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className="h-8 px-2.5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-5 mx-1 bg-border/60" />

      {/* GRUP 2: Format Teks */}
      <div className="flex items-center bg-muted/50 p-0.5 rounded-md border border-border/50">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          className="h-8 px-2.5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 px-2.5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-5 mx-1 bg-border/60" />

      {/* GRUP 3: List */}
      <div className="flex items-center bg-muted/50 p-0.5 rounded-md border border-border/50">
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          className="h-8 px-2.5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          className="h-8 px-2.5 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="flex-1" />

      {/* GRUP 4: History */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
