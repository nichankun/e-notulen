"use client";

import { useState, useEffect, use, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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

  // Kombinasi state untuk transisi halaman
  const isRouting = isSaving || isPending;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => setProgress(66), 500);
    }
    return () => clearTimeout(timer);
  }, [loading]);

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
              if (Array.isArray(parsedPhotos)) {
                setPhotos(parsedPhotos);
              }
            } catch (e) {
              console.error("Gagal parse photos:", e);
              setPhotos([]);
            }
          }
        } else {
          toast.error("Rapat tidak ditemukan");
          router.push("/dashboard");
        }
      } catch (e: unknown) {
        // PERBAIKAN: Gunakan unknown untuk error fetch awal
        console.error(e);
      } finally {
        setProgress(100);
        setTimeout(() => setLoading(false), 300);
      }
    };
    initData();
  }, [id, router]);

  // OPTIMASI: Polling dengan AbortController agar tidak memory leak
  useEffect(() => {
    const controller = new AbortController();

    const fetchAttendees = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/attendees`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (json.success) setAttendees(json.data);
      } catch (e: unknown) {
        // PERBAIKAN: Ganti any menjadi unknown
        // Validasi tipe error sebelum membaca property .name
        if (e instanceof Error && e.name !== "AbortError") {
          console.error("Polling error", e);
        }
      }
    };

    fetchAttendees();
    const interval = setInterval(fetchAttendees, 3000);

    return () => {
      clearInterval(interval);
      controller.abort(); // Batalkan antrean fetch jika user pindah halaman
    };
  }, [id]);

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
          description: "Notulen dan data absensi telah diarsipkan.",
        });
        setIsDialogOpen(false);

        // OPTIMASI: Navigasi menggunakan useTransition agar smooth
        startTransition(() => {
          router.push("/dashboard/archive");
          router.refresh();
        });
      } else {
        toast.error("Gagal Menyimpan");
        setIsSaving(false);
      }
    } catch (e: unknown) {
      // PERBAIKAN: Ganti any menjadi unknown
      console.error(e);
      toast.error("Error Jaringan");
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
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
        toast.success("Draft Disimpan", {
          description: "Perubahan notulen berhasil disimpan.",
          duration: 2000,
        });
      }
    } catch (e: unknown) {
      // PERBAIKAN: Ganti any menjadi unknown
      console.error(e);
      toast.error("Gagal Simpan Draft");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 max-w-sm mx-auto p-4">
        <div className="flex flex-col items-center text-slate-500 mb-4">
          <Loader2 className="animate-spin h-10 w-10 mb-4 text-blue-600" />
          <p className="font-semibold text-sm">Menyiapkan Ruang Rapat...</p>
          <p className="text-xs text-slate-400 mt-1">
            Mengambil data peserta dan notulen.
          </p>
        </div>
        <Progress value={progress} className="w-full h-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-0">
      <MeetingHeader date={meetingData?.date} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <MeetingQRCode meetingId={id} origin={origin} />
          <MeetingAttendees attendees={attendees} />
        </div>

        <div className="lg:col-span-2 h-full">
          <MeetingEditor
            title={meetingData?.title || ""}
            leader={meetingData?.leader || ""}
            content={notulen}
            setContent={setNotulen}
            photos={photos}
            setPhotos={setPhotos}
            onSaveDraft={handleSaveDraft}
            onFinish={() => setIsDialogOpen(true)}
            isSaving={isRouting}
          />
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Selesaikan Rapat?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan mengakhiri absensi dan mengarsipkan notulensi
              secara permanen. Pastikan semua data pembahasan telah tercatat
              dengan benar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRouting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleFinish();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isRouting}
            >
              {isRouting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </div>
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
