"use client";

import { Save, Loader2, Camera, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface MeetingEditorProps {
  title?: string;
  leader?: string;
  content: string;
  setContent: (val: string) => void;
  onSaveDraft: () => void;
  onFinish: () => void;
  isSaving: boolean;
}

export function MeetingEditor({
  title,
  leader,
  content,
  setContent,
  onSaveDraft,
  onFinish,
  isSaving,
}: MeetingEditorProps) {
  return (
    <Card className="h-full flex flex-col border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500">Pimpinan: {leader}</p>
        </div>
        <Button
          onClick={onSaveDraft}
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex-1 p-6 bg-white flex flex-col min-h-125">
        <Textarea
          className="flex-1 w-full p-4 bg-slate-50 rounded-xl border-slate-200 focus-visible:ring-blue-200 resize-none font-mono text-sm leading-relaxed text-slate-700"
          placeholder="Mulai mengetik notulensi rapat di sini..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            className="text-slate-600 text-xs font-bold h-8"
          >
            <Camera className="mr-2 h-3 w-3" /> Lampirkan Foto
          </Button>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end">
        <Button
          onClick={onFinish}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 text-white px-6 h-12 rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCheck className="mr-2 h-5 w-5" /> Finalisasi & Simpan
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
