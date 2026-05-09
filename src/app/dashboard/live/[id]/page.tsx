"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronRight,
  QrCode,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabaseClient";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MeetingHeader } from "@/components/dashboard/live/meeting-header";
import { MeetingQRCode } from "@/components/dashboard/live/meeting-qr";
import { MeetingAttendees } from "@/components/dashboard/live/meeting-attendees";
import { MeetingEditor } from "@/components/dashboard/live/meeting-editor";
import { PhotoDocumentation } from "@/components/dashboard/live/photo-documentation";

import { LoadingScreen } from "./loading-screen";
import { MobileSaveStatus } from "./mobile-save-status";
import { FinishMeetingDialog } from "./finish-meeting-dialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LiveMeetingPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  // --- DATA STATES ---
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [notulen, setNotulen] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);

  // --- UI & UPLOAD STATES ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(13);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // State Collapsible
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAttendeesOpen, setIsAttendeesOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  // 1. Fetch & Sync Logic
  useEffect(() => {
    const initData = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}`);
        const json = await res.json();
        if (json.success) {
          setMeetingData(json.data);
          setNotulen(json.data.content || "");
          if (json.data.photos && typeof json.data.photos === "string") {
            try {
              const parsed = JSON.parse(json.data.photos);
              if (Array.isArray(parsed)) setPhotos(parsed);
            } catch {
              setPhotos([]);
            }
          }
        } else {
          router.push("/dashboard");
        }
      } catch {
        toast.error("Gagal memuat data");
      } finally {
        setProgress(100);
        setTimeout(() => setLoading(false), 300);
      }
    };
    initData();
  }, [id, router]);

  // Logika Polling Peserta
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/attendees`);
        const json = await res.json();
        if (json.success) setAttendees(json.data);
      } catch {
        // Silent error for polling
      }
    };
    fetchAttendees();
    const interval = setInterval(fetchAttendees, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // Logika Unggah Foto
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const newUrls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("notulen")
          .upload(fileName, compressed);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage
          .from("notulen")
          .getPublicUrl(fileName);
        if (data.publicUrl) newUrls.push(data.publicUrl);
      }
      setPhotos([...photos, ...newUrls]);
      toast.success("Foto ditambahkan");
    } catch {
      toast.error("Gagal unggah foto");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Auto-Save Logic
  useEffect(() => {
    if (loading) return;
    const saveTimer = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await fetch(`/api/meetings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: notulen, photos }),
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, 3000);
    return () => clearTimeout(saveTimer);
  }, [notulen, photos, id, loading]);

  // Finalize Meeting
  const handleFinish = async () => {
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: notulen, photos, status: "archived" }),
      });
      if (res.ok) {
        toast.success("Rapat Selesai");
        setIsDialogOpen(false);
        router.push("/dashboard/archive");
        router.refresh();
      }
    } catch {
      toast.error("Gagal menyelesaikan rapat");
    }
  };

  if (loading) return <LoadingScreen progress={progress} />;

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      {/* HEADER: Menggunakan w-full tanpa batasan max-width */}
      <header className="bg-background border-b sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm transition-all w-full">
        <MeetingHeader
          date={meetingData?.date ? new Date(meetingData.date) : undefined}
        />
        <MobileSaveStatus saveStatus={saveStatus} />
      </header>

      {/* MAIN CONTENT: max-w-full agar mentok kiri-kanan */}
      <main className="flex-1 w-full max-w-full  py-6 transition-all">
        {/* Grid lebar dengan porsi kolom yang dioptimalkan untuk layar lebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SIDEBAR: Porsi kecil di sisi kiri */}
          <div className="lg:col-span-3 xl:col-span-2 space-y-4 lg:sticky lg:top-20">
            <Collapsible
              open={isQrOpen}
              onOpenChange={setIsQrOpen}
              className="bg-background border rounded-xl shadow-sm overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <QrCode className="h-4 w-4 text-muted-foreground" /> QR Code
                  </div>
                  {isQrOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t p-2">
                <MeetingQRCode meetingId={id} origin={origin} />
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={isAttendeesOpen}
              onOpenChange={setIsAttendeesOpen}
              className="bg-background border rounded-xl shadow-sm overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <Users className="h-4 w-4 text-muted-foreground" /> Peserta
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-bold">
                      {attendees.length}
                    </span>
                    {isAttendeesOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t">
                <MeetingAttendees attendees={attendees} />
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={isPhotosOpen}
              onOpenChange={setIsPhotosOpen}
              className="bg-background border rounded-xl shadow-sm overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" /> Foto
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-bold">
                      {photos.length}
                    </span>
                    {isPhotosOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t">
                <PhotoDocumentation
                  photos={photos}
                  isUploading={isUploading}
                  fileInputRef={fileInputRef}
                  onUpload={handlePhotoUpload}
                  onRemove={(idx) =>
                    setPhotos(photos.filter((_, i) => i !== idx))
                  }
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* EDITOR AREA: Porsi paling besar, menghabiskan sisa ruang layar */}
          <div className="lg:col-span-9 xl:col-span-10">
            <MeetingEditor
              title={meetingData?.title || ""}
              leader={meetingData?.leader || ""}
              content={notulen}
              setContent={setNotulen}
              onFinish={() => setIsDialogOpen(true)}
              isSaving={false}
              saveStatus={saveStatus}
            />
          </div>
        </div>
      </main>

      <FinishMeetingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onFinish={handleFinish}
        isRouting={false}
      />
    </div>
  );
}
