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
    <div className="border-b bg-background/95 backdrop-blur-md p-2 flex gap-1.5 items-center sticky top-10 z-10 shadow-sm px-4 md:px-6 overflow-x-auto scrollbar-hide w-full">
      <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md border shrink-0">
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 2 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className="data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("heading", { level: 3 })}
          onPressedChange={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className="data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="w-px h-6 bg-border mx-1 shrink-0" />

      <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md border shrink-0">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          className="data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          className="data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="w-px h-6 bg-border mx-1 shrink-0" />

      <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md border shrink-0">
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          className="data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          className="data-[state=on]:bg-background data-[state=on]:shadow-sm"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="flex-1 min-w-5" />

      <div className="flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
