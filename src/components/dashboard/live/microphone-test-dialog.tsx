"use client";

import { CheckCircle2, Mic, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import type {
  MicrophoneTestState,
  MicrophoneTestStatus,
} from "./hooks/use-microphone-test";

const statusLabel: Record<MicrophoneTestStatus, string> = {
  idle: "Belum dites",
  testing: "Sedang mengukur",
  passed: "Siap digunakan",
  too_quiet: "Terlalu pelan",
  too_loud: "Terlalu keras",
  failed: "Gagal",
};

export function MicrophoneTestDialog({
  open,
  onOpenChange,
  state,
  onRun,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: MicrophoneTestState;
  onRun: () => void;
}) {
  const isTesting = state.status === "testing";
  const isGood = state.status === "passed";
  const hasError = ["too_quiet", "too_loud", "failed"].includes(state.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tes mikrofon 3 detik</DialogTitle>
          <DialogDescription>
            Tes ini tidak menyimpan rekaman. Gunakan mikrofon yang akan dipakai saat rapat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isGood ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : hasError ? (
                <TriangleAlert className="h-5 w-5 text-amber-600" />
              ) : (
                <Mic className="h-5 w-5 text-indigo-600" />
              )}
              <span className="text-sm font-medium">{state.message}</span>
            </div>
            <Badge variant="outline">{statusLabel[state.status]}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Level rata-rata</span>
              <span>{state.averageDb === null ? "—" : `${state.averageDb} dB`}</span>
            </div>
            <Progress value={state.levelPercent} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Puncak input</span>
              <span>{state.peakPercent}%</span>
            </div>
            <Progress value={state.peakPercent} className="h-2 [&_[data-slot=progress-indicator]]:bg-amber-500" />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isTesting}>
            Tutup
          </Button>
          <Button type="button" onClick={onRun} disabled={isTesting}>
            {isTesting ? "Mendengarkan..." : state.status === "idle" ? "Mulai Tes 3 Detik" : "Tes Ulang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
