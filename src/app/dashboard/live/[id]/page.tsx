"use client";

import { useState, useEffect, use, useTransition } from "react";
import { useRouter } from "next/navigation";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { toast } from "sonner";

import { MeetingHeader } from "@/components/dashboard/live/meeting-header";
import { MeetingQRCode } from "@/components/dashboard/live/meeting-qr";
import { MeetingAttendees } from "@/components/dashboard/live/meeting-attendees";
import { MeetingEditor } from "@/components/dashboard/live/meeting-editor";

import { LoadingScreen } from "./loading-screen";
import { MobileSaveStatus } from "./mobile-save-status";
import { FinishMeetingDialog } from "./finish-meeting-dialog";

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

  // Status khusus Auto-Save
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

  // 3. Polling Attendees
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

  // 4. AUTO-SAVE LOGIC
  useEffect(() => {
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
          body: JSON.stringify({ content: notulen, photos: photos }),
        });

        if (res.ok) {
          setSaveStatus("saved");
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
    return <LoadingScreen progress={progress} />;
  }

  return (
    // PERBAIKAN: Menghapus font-sans dan menyelaraskan padding serta animasi masuk
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 p-4 md:p-6 bg-background">
      {/* HEADER SECTION: Desktop & Mobile Save Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <MeetingHeader
          date={meetingData?.date ? new Date(meetingData.date) : undefined}
        />

        {/* Indikator Status Auto-Save Mobile (Hanya tampil di layar kecil) */}
        <MobileSaveStatus saveStatus={saveStatus} />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* KOLOM KIRI: QR Code & Attendees (Sticky di desktop) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 h-fit">
          <MeetingQRCode meetingId={id} origin={origin} />
          <MeetingAttendees attendees={attendees} />
        </div>

        {/* KOLOM KANAN: Text Editor & Foto */}
        <div className="lg:col-span-2">
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

      {/* Dialog Konfirmasi Selesai */}
      <FinishMeetingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onFinish={handleFinish}
        isRouting={isRouting}
      />
    </div>
  );
}
