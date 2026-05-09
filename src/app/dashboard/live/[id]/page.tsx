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

  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [notulen, setNotulen] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(13);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAttendeesOpen, setIsAttendeesOpen] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

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

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/attendees`);
        const json = await res.json();
        if (json.success) setAttendees(json.data);
      } catch {}
    };
    fetchAttendees();
    const interval = setInterval(fetchAttendees, 3000);
    return () => clearInterval(interval);
  }, [id]);

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
      {/* HEADER */}
      <header className="bg-background border-b sticky top-0 z-30 px-4 py-2 flex items-center justify-between w-full">
        <MeetingHeader
          date={meetingData?.date ? new Date(meetingData.date) : undefined}
        />
        <MobileSaveStatus saveStatus={saveStatus} />
      </header>

      {/* MAIN */}
      <main className="flex-1 w-full px-3 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* SIDEBAR */}
          <div className="lg:col-span-3 xl:col-span-2 space-y-1.5 lg:sticky lg:top-14">
            {/* QR Code */}
            <Collapsible
              open={isQrOpen}
              onOpenChange={setIsQrOpen}
              className="bg-background border rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <QrCode className="h-3.5 w-3.5" />
                    QR Code
                  </div>
                  {isQrOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t p-2">
                <MeetingQRCode meetingId={id} origin={origin} />
              </CollapsibleContent>
            </Collapsible>

            {/* Peserta */}
            <Collapsible
              open={isAttendeesOpen}
              onOpenChange={setIsAttendeesOpen}
              className="bg-background border rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Peserta
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full font-semibold text-muted-foreground">
                      {attendees.length}
                    </span>
                    {isAttendeesOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t">
                <MeetingAttendees attendees={attendees} />
              </CollapsibleContent>
            </Collapsible>

            {/* Foto */}
            <Collapsible
              open={isPhotosOpen}
              onOpenChange={setIsPhotosOpen}
              className="bg-background border rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Foto
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full font-semibold text-muted-foreground">
                      {photos.length}
                    </span>
                    {isPhotosOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
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

          {/* EDITOR */}
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
