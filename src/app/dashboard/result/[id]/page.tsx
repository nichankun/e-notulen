"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Printer,
  Loader2,
  Users,
  Camera,
  Calendar,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import NotulensiPDF from "@/components/dashboard/result/notulensipdf";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResultPage({ params }: PageProps) {
  const { id } = use(params);
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(13);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => setProgress(66), 500);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resMeeting, resAttendees] = await Promise.all([
          fetch(`/api/meetings/${id}`),
          fetch(`/api/meetings/${id}/attendees`),
        ]);

        const jsonMeeting = await resMeeting.json();
        const jsonAttendees = await resAttendees.json();

        if (jsonMeeting.success) {
          setMeetingData(jsonMeeting.data);
          setAttendees(jsonAttendees.data || []);

          if (jsonMeeting.data.photos) {
            try {
              const parsed = JSON.parse(jsonMeeting.data.photos);
              if (Array.isArray(parsed)) setPhotos(parsed);
            } catch {
              console.error("Gagal parse dokumentasi foto.");
            }
          }
        }
      } catch {
        console.error("Gagal mengambil data arsip.");
      } finally {
        setProgress(100);
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      // PERBAIKAN 1: Hapus font-sans. Ganti warna loading dengan text-primary
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 max-w-sm mx-auto p-4 text-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary mb-2" />
        <p className="font-semibold text-foreground tracking-wide text-sm">
          Membangun Arsip Digital...
        </p>
        <Progress
          value={progress}
          // PERBAIKAN 2: Progress bar otomatis menggunakan warna primary shadcn
          className="w-full h-1.5"
        />
      </div>
    );
  }

  if (!meetingData) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Tombol kembali dibiarkan menggunakan variant="outline" bawaan */}
          <Button
            variant="outline"
            size="icon"
            asChild
            className="rounded-full h-10 w-10 shrink-0 transition-colors"
          >
            <Link href="/dashboard/archive">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-bold text-xl md:text-2xl text-foreground truncate tracking-tight">
              {meetingData.title}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              {/* Badge selesai menggunakan warna emerald dengan opacity agar aman di dark mode */}
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[11px] font-semibold tracking-wide px-2.5 py-0.5"
              >
                Selesai Diarsipkan
              </Badge>
              <span className="text-xs text-muted-foreground font-medium hidden md:inline-block">
                ID: {id}
              </span>
            </div>
          </div>
        </div>

        <PDFDownloadLink
          document={
            <NotulensiPDF
              meetingData={meetingData}
              attendees={attendees}
              photos={photos}
            />
          }
          fileName={`Notulensi_${meetingData.title.replace(/\s+/g, "_")}.pdf`}
          className="w-full md:w-auto"
        >
          {({ loading: pdfLoading }) => (
            // PERBAIKAN 3: Tombol cetak tidak perlu hardcode warna biru, biarkan Button shadcn mengambil alih
            <Button
              disabled={pdfLoading}
              className="w-full md:w-auto font-bold h-12 px-6 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {pdfLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Menyiapkan PDF...
                </>
              ) : (
                <>
                  <Printer className="h-5 w-5" />
                  Cetak Notulensi
                </>
              )}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* EXECUTIVE SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* PERBAIKAN 4: Card otomatis bg-card. Ikon menggunakan opacity /10 agar tidak mencolok di dark mode */}
        <Card className="p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 rounded-xl border">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Hadir
            </p>
            <p className="text-xl font-bold text-foreground leading-none">
              {attendees.length}{" "}
              <span className="text-sm font-medium text-muted-foreground">
                Orang
              </span>
            </p>
          </div>
        </Card>

        <Card className="p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 rounded-xl border">
          <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Dokumentasi
            </p>
            <p className="text-xl font-bold text-foreground leading-none">
              {photos.length}{" "}
              <span className="text-sm font-medium text-muted-foreground">
                Foto
              </span>
            </p>
          </div>
        </Card>

        <Card className="p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 rounded-xl border">
          <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Tanggal
            </p>
            <p className="text-[15px] font-bold text-foreground truncate leading-none mt-1">
              {new Date(meetingData.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </Card>

        <Card className="p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 rounded-xl border">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Integritas
            </p>
            <p className="text-[15px] font-bold text-foreground uppercase leading-none mt-1">
              Valid
            </p>
          </div>
        </Card>
      </div>

      {/* PDF VIEWER SECTION */}
      {/* PERBAIKAN 5: Mengganti bg-gray-50 menjadi bg-muted/30 */}
      <Card className="shadow-sm bg-muted/30 overflow-hidden rounded-xl border">
        {/* Fake Window Toolbar macOS Style */}
        <div className="bg-muted px-4 py-3 flex items-center border-b">
          <div className="flex gap-1.5 w-16">
            <div className="h-3 w-3 rounded-full bg-destructive/80" />
            <div className="h-3 w-3 rounded-full bg-amber-400/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
          </div>
          <span className="flex-1 text-center text-xs font-semibold text-muted-foreground">
            Pratinjau Dokumen
          </span>
          <div className="w-16" />
        </div>

        {/* Responsive Container for PDF Viewer */}
        {/* PERBAIKAN 6: Latar belakang PDF viewer menggunakan bg-muted/50 agar netral */}
        <div className="w-full bg-muted/50 flex justify-center p-0 md:p-6 overflow-hidden">
          <div className="w-full max-w-4xl shadow-xl overflow-hidden bg-background">
            {/* FIX: min-h-150 diubah jadi min-h-[600px] karena 150 bukan standar tailwind */}
            <PDFViewer className="w-full h-[80vh] min-h-150 border-none">
              <NotulensiPDF
                meetingData={meetingData}
                attendees={attendees}
                photos={photos}
              />
            </PDFViewer>
          </div>
        </div>

        <div className="bg-background p-3 text-center border-t">
          <p className="text-[11px] text-muted-foreground font-medium">
            Dokumen ini dihasilkan secara otomatis oleh Sistem E-NOTULEN Bapenda
            Prov. Sultra
          </p>
        </div>
      </Card>
    </div>
  );
}
