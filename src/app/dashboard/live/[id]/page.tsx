"use client";

import { useState, useEffect, use, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCheck, CloudOff } from "lucide-react";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { toast } from "sonner";

import { MeetingHeader } from "@/components/dashboard/live/meeting-header";
import { MeetingQRCode } from "@/components/dashboard/live/meeting-qr";
import { MeetingAttendees } from "@/components/dashboard/live/meeting-attendees";
import { MeetingEditor } from "@/components/dashboard/live/meeting-editor";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LiveMeetingPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Data State
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [notulen, setNotulen] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [origin, setOrigin] = useState("");

  // UI State
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [progress, setProgress] = useState(13);

  // Status khusus Auto-Save: idle | saving | saved | error
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const isRouting = isSaving || isPending;

  // 1. Progress Bar Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => setProgress(66), 500);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // 2. Fetch Initial Data
  useEffect(() => {
    setOrigin(window.location.origin);

    const initData = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}`);
        const json = await res.json();

        if (json.success) {
          setMeetingData(json.data);
          setNotulen(json.data.content || "");
          if (json.data.photos) {
            try {
              const parsedPhotos = JSON.parse(json.data.photos);
              if (Array.isArray(parsedPhotos)) setPhotos(parsedPhotos);
            } catch {
              setPhotos([]);
            }
          }
        } else {
          toast.error("Rapat tidak ditemukan");
          router.push("/dashboard");
        }
      } catch {
        console.error("Gagal inisialisasi data rapat.");
      } finally {
        setProgress(100);
        setTimeout(() => setLoading(false), 300);
      }
    };
    initData();
  }, [id, router]);

  // 3. Polling Attendees with AbortController
  useEffect(() => {
    const controller = new AbortController();
    const fetchAttendees = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/attendees`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (json.success) setAttendees(json.data);
      } catch (_error) {
        if (_error instanceof Error && _error.name !== "AbortError") {
          console.error("Polling error:", _error.message);
        }
      }
    };

    fetchAttendees();
    const interval = setInterval(fetchAttendees, 3000);
    return () => {
      clearInterval(interval);
      controller.abort();
    };
  }, [id]);

  // 4. 🔥 AUTO-SAVE LOGIC (Debounced 3s)
  useEffect(() => {
    if (loading || isSaving || notulen === meetingData?.content) return;

    const timer = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const res = await fetch(`/api/meetings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: notulen,
            photos: photos,
          }),
        });

        if (res.ok) {
          setSaveStatus("saved");
          // Update data pembanding agar tidak loop terus menerus
          setMeetingData((prev) =>
            prev
              ? { ...prev, content: notulen, photos: JSON.stringify(photos) }
              : null,
          );
          setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [notulen, photos, id, loading, isSaving, meetingData]);

  // 5. Finalize Meeting
  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: notulen,
          photos: photos,
          status: "completed",
        }),
      });

      if (res.ok) {
        toast.success("Rapat Selesai", {
          description: "Notulen telah diarsipkan.",
        });
        setIsDialogOpen(false);
        startTransition(() => {
          router.push("/dashboard/archive");
          router.refresh();
        });
      } else {
        toast.error("Gagal Menyimpan");
        setIsSaving(false);
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 max-w-sm mx-auto p-4 text-center">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        <p className="font-bold text-slate-700">Menyiapkan Ruang Rapat...</p>
        <Progress value={progress} className="w-full h-1.5" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <MeetingHeader date={meetingData?.date} />

        {/* Indikator Status Auto-Save (Hanya muncul di Mobile/Header) */}
        <div className="flex lg:hidden items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm">
          {saveStatus === "saving" && (
            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
          )}
          {saveStatus === "saved" && (
            <CheckCheck className="h-3 w-3 text-green-600" />
          )}
          {saveStatus === "error" && (
            <CloudOff className="h-3 w-3 text-red-500" />
          )}
          <span className="text-[10px] font-black uppercase text-slate-500">
            {saveStatus === "saving"
              ? "Menyimpan..."
              : saveStatus === "saved"
                ? "Tersimpan"
                : "E-Notulen Live"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <MeetingQRCode meetingId={id} origin={origin} />
          <MeetingAttendees attendees={attendees} />
        </div>

        <div className="lg:col-span-2">
          {/* 🔥 SINKRONISASI: Mengirim saveStatus ke Editor */}
          <MeetingEditor
            title={meetingData?.title || ""}
            leader={meetingData?.leader || ""}
            content={notulen}
            setContent={setNotulen}
            photos={photos}
            setPhotos={setPhotos}
            onFinish={() => setIsDialogOpen(true)}
            isSaving={isRouting}
            saveStatus={saveStatus}
          />
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-white rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black uppercase tracking-tight">
              Selesaikan Rapat?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Data absensi dan notulensi akan diarsipkan secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isRouting} className="rounded-xl">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleFinish();
              }}
              className="bg-slate-900 hover:bg-blue-700 text-white rounded-xl font-bold transition-all"
              disabled={isRouting}
            >
              {isRouting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Ya, Selesaikan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
