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
  ArrowLeft,
  Info,
  FileText,
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
import { FinishMeetingDialog } from "./finish-meeting-dialog";

interface PageProps {
  params: Promise<{ id: string }>;
}

type MobileTab = "editor" | "qr" | "attendees" | "photos";

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
  const [mobileTab, setMobileTab] = useState<MobileTab>("editor");

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
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}.jpg`;
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
        localStorage.removeItem(`transcript-${id}`);
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

  const mobileTabs: {
    key: MobileTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { key: "editor", label: "Notulen", icon: <FileText className="h-5 w-5" /> },
    { key: "qr", label: "QR Code", icon: <QrCode className="h-5 w-5" /> },
    {
      key: "attendees",
      label: "Peserta",
      icon: <Users className="h-5 w-5" />,
      badge: attendees.length,
    },
    {
      key: "photos",
      label: "Foto",
      icon: <ImageIcon className="h-5 w-5" />,
      badge: photos.length > 0 ? photos.length : undefined,
    },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════
          DESKTOP (lg ke atas)
      ══════════════════════════════════════════ */}
      <div className="hidden lg:block w-full">
        <div className="mb-3">
          <MeetingHeader
            date={meetingData?.date ? new Date(meetingData.date) : undefined}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          <div className="lg:col-span-3 xl:col-span-2 space-y-1.5 lg:sticky lg:top-14">
            <Collapsible
              open={isQrOpen}
              onOpenChange={setIsQrOpen}
              className="bg-background border border-border rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors">
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
              <CollapsibleContent className="border-t border-border p-2">
                <MeetingQRCode meetingId={id} origin={origin} />
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={isAttendeesOpen}
              onOpenChange={setIsAttendeesOpen}
              className="bg-background border border-border rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors">
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
              <CollapsibleContent className="border-t border-border">
                <MeetingAttendees attendees={attendees} />
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={isPhotosOpen}
              onOpenChange={setIsPhotosOpen}
              className="bg-background border border-border rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors">
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
              <CollapsibleContent className="border-t border-border">
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

          <div className="lg:col-span-9 xl:col-span-10">
            <MeetingEditor
              id={id}
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
      </div>

      {/* ══════════════════════════════════════════
          MOBILE (di bawah lg)
      ══════════════════════════════════════════ */}
      <div className="lg:hidden fixed inset-0 z-50 flex flex-col bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">
              {meetingData?.title || "Rapat Berlangsung"}
            </h1>
            {meetingData?.date && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(meetingData.date).toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Save status */}
          {saveStatus === "saving" && (
            <span className="text-xs text-muted-foreground font-medium shrink-0">
              Menyimpan…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-emerald-500 font-medium shrink-0">
              Tersimpan
            </span>
          )}

          {/* Icon tab buttons — QR, Peserta, Foto */}
          <div className="flex items-center gap-1 shrink-0">
            {mobileTabs
              .filter((t) => t.key !== "editor")
              .map((tab) => {
                const isActive = mobileTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() =>
                      setMobileTab(tab.key === mobileTab ? "editor" : tab.key)
                    }
                    title={tab.label}
                    className={`relative p-2 rounded-xl transition-all duration-150 active:scale-95
                      ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                    {tab.icon}
                  </button>
                );
              })}
          </div>
        </header>

        {/* Info banner */}
        <div className="mx-4 mt-3 mb-1 bg-primary/10 rounded-xl px-4 py-3 flex items-start gap-2.5 shrink-0">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-primary font-medium leading-relaxed">
            Rapat sedang berlangsung. Notulen disimpan otomatis setiap
            perubahan.
          </p>
        </div>

        {/* Sub-header saat tab non-editor aktif */}
        {mobileTab !== "editor" && (
          <div className="mx-4 mt-2 mb-1 flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMobileTab("editor")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Notulen</span>
            </button>
            <span className="text-muted">·</span>
            <span className="text-xs font-semibold text-foreground">
              {mobileTab === "qr" && "QR Code"}
              {mobileTab === "attendees" && "Peserta"}
              {mobileTab === "photos" && "Foto Dokumentasi"}
            </span>
          </div>
        )}

        {/* Konten tab */}
        <div className="flex-1 overflow-y-auto pb-4">
          {mobileTab === "editor" && (
            <div className="px-4 py-3">
              <MeetingEditor
                id={id}
                title={meetingData?.title || ""}
                leader={meetingData?.leader || ""}
                content={notulen}
                setContent={setNotulen}
                onFinish={() => setIsDialogOpen(true)}
                isSaving={false}
                saveStatus={saveStatus}
              />
            </div>
          )}

          {mobileTab === "qr" && (
            <div className="px-4 py-6 flex flex-col items-center gap-5">
              <div className="w-full bg-background border border-border rounded-2xl shadow-sm p-5 flex flex-col items-center gap-4">
                <p className="text-sm font-semibold text-foreground">
                  Scan untuk Bergabung
                </p>
                <MeetingQRCode meetingId={id} origin={origin} />
                <p className="text-xs text-muted-foreground text-center">
                  Arahkan kamera ke QR Code di atas
                </p>
              </div>
            </div>
          )}

          {mobileTab === "attendees" && (
            <div className="px-4 py-4">
              <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Peserta
                  </p>
                  <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
                    {attendees.length} orang
                  </span>
                </div>
                <MeetingAttendees attendees={attendees} />
              </div>
            </div>
          )}

          {mobileTab === "photos" && (
            <div className="px-4 py-4">
              <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">
                    Foto Dokumentasi
                  </p>
                  {photos.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
                      {photos.length} foto
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <PhotoDocumentation
                    photos={photos}
                    isUploading={isUploading}
                    fileInputRef={fileInputRef}
                    onUpload={handlePhotoUpload}
                    onRemove={(idx) =>
                      setPhotos(photos.filter((_, i) => i !== idx))
                    }
                  />
                </div>
              </div>
            </div>
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
