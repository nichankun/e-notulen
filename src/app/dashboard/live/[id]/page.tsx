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
    // Sinkronisasi pengecekan: Cek perubahan pada notulen ATAU foto
    const hasContentChanged = notulen !== (meetingData?.content ?? "");
    const currentPhotosJson = JSON.stringify(photos);
    const savedPhotosJson = meetingData?.photos ?? "[]";
    const hasPhotosChanged = currentPhotosJson !== savedPhotosJson;

    if (loading || isSaving || (!hasContentChanged && !hasPhotosChanged))
      return;

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
          status: "archived",
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
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 max-w-sm mx-auto p-4 text-center font-sans">
        <Loader2 className="animate-spin h-10 w-10 text-[#0866ff]" />
        <p className="font-semibold text-gray-700">Menyiapkan Ruang Rapat...</p>
        {/* Mengubah warna progress bar menjadi biru khas */}
        <Progress
          value={progress}
          className="w-full h-1.5 [&>div]:bg-[#0866ff]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Memastikan date selalu diproses sebagai objek Date untuk konsistensi UI */}
        <MeetingHeader
          date={meetingData?.date ? new Date(meetingData.date) : undefined}
        />

        {/* Indikator Status Auto-Save (Hanya muncul di Mobile/Header) */}
        {/* Diselaraskan warnanya dengan palet abu-abu terang */}
        <div className="flex lg:hidden items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {saveStatus === "saving" && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0866ff]" />
          )}
          {saveStatus === "saved" && (
            <CheckCheck className="h-3.5 w-3.5 text-[#25D366]" />
          )}
          {saveStatus === "error" && (
            <CloudOff className="h-3.5 w-3.5 text-red-500" />
          )}
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {saveStatus === "saving"
              ? "Menyimpan..."
              : saveStatus === "saved"
                ? "Tersimpan"
                : "E-Notulen Live"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
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
        {/* Sudut dialog dilunakkan menjadi rounded-2xl dan warna background dipastikan putih solid */}
        <AlertDialogContent className="bg-white rounded-2xl border-gray-100 p-6 md:p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-gray-900 text-xl tracking-tight">
              Selesaikan Rapat?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 text-[15px] mt-2">
              Data absensi dan notulensi akan diarsipkan secara permanen. Anda
              tidak dapat mengubahnya lagi setelah ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel
              disabled={isRouting}
              className="rounded-full h-11 px-6 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleFinish();
              }}
              className="bg-[#0866ff] hover:bg-[#1877f2] text-white rounded-full h-11 px-6 font-bold transition-colors"
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
