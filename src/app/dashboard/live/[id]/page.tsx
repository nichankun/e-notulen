"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { toast } from "sonner"; // 1. Import Sonner

// Import Components Baru
import { MeetingHeader } from "@/components/dashboard/live/meeting-header";
import { MeetingQRCode } from "@/components/dashboard/live/meeting-qr";
import { MeetingAttendees } from "@/components/dashboard/live/meeting-attendees";
import { MeetingEditor } from "@/components/dashboard/live/meeting-editor";

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
    if (!confirm("Selesaikan rapat dan simpan notulen ke database?")) return;

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
        router.push("/dashboard/archive");
        router.refresh();
      } else {
        toast.error("Gagal Menyimpan", {
          description: "Terjadi kesalahan saat menyimpan data.",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Error Jaringan", {
        description: "Periksa koneksi internet Anda.",
      });
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

  // UPDATE: Padding responsif p-4 md:p-0
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
            onFinish={handleFinish}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
