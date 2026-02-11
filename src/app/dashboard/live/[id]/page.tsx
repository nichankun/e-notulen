"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { toast } from "sonner";

// Import Components
import { MeetingHeader } from "@/components/dashboard/live/meeting-header";
import { MeetingQRCode } from "@/components/dashboard/live/meeting-qr";
import { MeetingAttendees } from "@/components/dashboard/live/meeting-attendees";
import { MeetingEditor } from "@/components/dashboard/live/meeting-editor";

// Import UI Shadcn
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LiveMeetingPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Data State
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [notulen, setNotulen] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [origin, setOrigin] = useState("");

  // UI State
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State untuk Modal

  // 1. Initial Data Fetching
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id, router]);

  // 2. Real-time Attendance Polling
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/attendees`);
        const json = await res.json();
        if (json.success) setAttendees(json.data);
      } catch (e) {
        console.error("Polling error", e);
      }
    };

    fetchAttendees();
    const interval = setInterval(fetchAttendees, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // 3. Handlers
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
        router.push("/dashboard/archive");
        router.refresh();
      } else {
        toast.error("Gagal Menyimpan");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error Jaringan");
    } finally {
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
    } catch (e) {
      console.error(e);
      toast.error("Gagal Simpan Draft");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-0">
      {/* 1. Header Component */}
      <MeetingHeader date={meetingData?.date} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KIRI: QR & Attendees */}
        <div className="lg:col-span-1 space-y-6">
          <MeetingQRCode meetingId={id} origin={origin} />
          <MeetingAttendees attendees={attendees} />
        </div>

        {/* KANAN: Editor */}
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
            isSaving={isSaving}
          />
        </div>
      </div>

      {/* MODAL KONFIRMASI FINALISASI */}
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
            <AlertDialogCancel disabled={isSaving}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleFinish();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSaving}
            >
              {isSaving ? (
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
