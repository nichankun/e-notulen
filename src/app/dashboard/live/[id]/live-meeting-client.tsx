"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { supabase } from "@/lib/supabaseClient";

import { MeetingEditor } from "@/components/dashboard/live/meeting-editor";
import { LoadingScreen } from "./loading-screen";
import { FinishMeetingDialog } from "./finish-meeting-dialog";
import { MobileHeader } from "./mobile-header";
import { MobilePanel } from "./mobile-panel";
import { DesktopSidebar } from "./desktop-sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MobileTab = "editor" | "qr" | "attendees" | "photos";

export interface PhotoProps {
  photos: string[];
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>; // ← tambah | null
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (idx: number) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function LiveMeetingClient({ id }: { id: string }) {
  const router = useRouter();

  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [notulen, setNotulen] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [initialTranscript, setInitialTranscript] = useState("");
  const [initialSummaryHtml, setInitialSummaryHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [progress, setProgress] = useState(13);
  const [mobileTab, setMobileTab] = useState<MobileTab>("editor");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  // Init meeting data
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}`);
        const json = await res.json();
        if (!json.success) {
          router.push("/dashboard");
          return;
        }

        const d = json.data;
        setMeetingData(d);
        setNotulen(d.content || "");
        if (d.transcript) setInitialTranscript(d.transcript);
        if (d.summaryHtml) setInitialSummaryHtml(d.summaryHtml);

        try {
          const parsed =
            typeof d.photos === "string" ? JSON.parse(d.photos) : [];
          if (Array.isArray(parsed)) setPhotos(parsed);
        } catch {
          setPhotos([]);
        }
      } catch {
        toast.error("Gagal memuat data");
      } finally {
        setProgress(100);
        setTimeout(() => setLoading(false), 300);
      }
    };
    init();
  }, [id, router]);

  // Poll attendees
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/attendees`);
        const json = await res.json();
        if (json.success) setAttendees(json.data);
      } catch {}
    };
    fetch_();
    const interval = setInterval(fetch_, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // Auto-save photos
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/meetings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos }),
        });
      } catch {
        console.error("Auto-save photos gagal");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [photos, id, loading]);

  const handlePhotoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      setIsUploading(true);
      const newUrls: string[] = [];
      try {
        for (const file of Array.from(files)) {
          const compressed = await imageCompression(
            file,
            IMAGE_COMPRESSION_OPTIONS,
          );
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
          const { error } = await supabase.storage
            .from("notulen")
            .upload(fileName, compressed);
          if (error) throw error;
          const { data } = supabase.storage
            .from("notulen")
            .getPublicUrl(fileName);
          if (data.publicUrl) newUrls.push(data.publicUrl);
        }
        setPhotos((prev) => [...prev, ...newUrls]);
        toast.success("Foto ditambahkan");
      } catch {
        toast.error("Gagal unggah foto");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [],
  );

  const handleRemovePhoto = useCallback(
    (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx)),
    [],
  );

  const handleFinish = useCallback(async () => {
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: notulen, photos, status: "archived" }),
      });
      if (res.ok) {
        localStorage.removeItem(`transcript-${id}`);
        toast.success("Rapat Selesai");
        setIsDialogOpen(false);
        router.push("/dashboard/archive");
        router.refresh();
      }
    } catch {
      toast.error("Gagal menyelesaikan rapat");
    }
  }, [id, notulen, photos, router]);

  const handleTabToggle = useCallback(
    (key: MobileTab) => setMobileTab((prev) => (prev === key ? "editor" : key)),
    [],
  );

  if (loading) return <LoadingScreen progress={progress} />;

  const editorProps = {
    id,
    title: meetingData?.title || "",
    leader: meetingData?.leader || "",
    content: notulen,
    setContent: setNotulen,
    onFinish: () => setIsDialogOpen(true),
    isSaving: false,
    saveStatus: "idle" as const,
    initialTranscript,
    initialSummaryHtml,
  };

  const photoProps: PhotoProps = {
    photos,
    isUploading,
    fileInputRef,
    onUpload: handlePhotoUpload,
    onRemove: handleRemovePhoto,
  };

  return (
    <>
      {/* ── DESKTOP ──────────────────────────────────────────────────────── */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 items-start pt-4 w-full">
        <DesktopSidebar
          meetingId={id}
          origin={origin}
          attendees={attendees}
          photoProps={photoProps}
        />
        <div className="lg:col-span-9 xl:col-span-10 h-[calc(100vh-32px)] flex flex-col min-h-0">
          <MeetingEditor {...editorProps} />
        </div>
      </div>

      {/* ── MOBILE ───────────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-background">
        <MobileHeader
          meeting={meetingData}
          activeTab={mobileTab}
          attendeeCount={attendees.length}
          photoCount={photos.length}
          onTabToggle={handleTabToggle}
          onBack={() => router.back()}
        />

        <div
          className={`flex-1 flex flex-col min-h-0 ${mobileTab === "editor" ? "overflow-hidden" : "overflow-y-auto"}`}
        >
          {mobileTab === "editor" ? (
            <div className="flex-1 flex flex-col min-h-0">
              <MeetingEditor {...editorProps} />
            </div>
          ) : (
            <MobilePanel
              activeTab={mobileTab}
              meetingId={id}
              origin={origin}
              attendees={attendees}
              photoProps={photoProps}
              onBack={() => setMobileTab("editor")}
            />
          )}
        </div>
      </div>

      <FinishMeetingDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onFinish={handleFinish}
        isRouting={false}
      />
    </>
  );
}
