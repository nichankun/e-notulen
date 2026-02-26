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

  // 1. Progress Bar Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => setProgress(66), 500);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // 2. Fetch Data (Fix: Catch block cleaned from unused 'e')
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
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 max-w-sm mx-auto p-4 text-center font-sans">
        <Loader2 className="animate-spin h-10 w-10 text-[#0866ff] mb-2" />
        <p className="font-semibold text-gray-700 tracking-wide text-sm">
          Membangun Arsip Digital...
        </p>
        <Progress
          value={progress}
          className="w-full h-1.5 [&>div]:bg-[#0866ff]"
        />
      </div>
    );
  }

  if (!meetingData) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="rounded-full h-10 w-10 shrink-0 border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Link href="/dashboard/archive">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-bold text-xl md:text-2xl text-gray-900 truncate tracking-tight">
              {meetingData.title}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge
                variant="secondary"
                className="bg-[#25D366]/10 text-[#20b858] hover:bg-[#25D366]/20 border-0 text-[11px] font-semibold tracking-wide px-2.5 py-0.5"
              >
                Selesai Diarsipkan
              </Badge>
              <span className="text-xs text-gray-400 font-medium hidden md:inline-block">
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
            <Button
              disabled={pdfLoading}
              className="bg-[#0866ff] hover:bg-[#1877f2] text-white w-full md:w-auto font-bold h-12 px-6 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm"
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
        <Card className="p-5 border-gray-100/50 shadow-sm md:shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 bg-white rounded-xl">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-[#0866ff] shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Hadir
            </p>
            <p className="text-xl font-bold text-gray-900 leading-none">
              {attendees.length}{" "}
              <span className="text-sm font-medium text-gray-500">Orang</span>
            </p>
          </div>
        </Card>

        <Card className="p-5 border-gray-100/50 shadow-sm md:shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 bg-white rounded-xl">
          <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Camera className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Dokumentasi
            </p>
            <p className="text-xl font-bold text-gray-900 leading-none">
              {photos.length}{" "}
              <span className="text-sm font-medium text-gray-500">Foto</span>
            </p>
          </div>
        </Card>

        <Card className="p-5 border-gray-100/50 shadow-sm md:shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 bg-white rounded-xl">
          <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Tanggal
            </p>
            <p className="text-[15px] font-bold text-gray-900 truncate leading-none mt-1">
              {new Date(meetingData.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </Card>

        <Card className="p-5 border-gray-100/50 shadow-sm md:shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 bg-white rounded-xl">
          <div className="h-12 w-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#20b858] shrink-0">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Integritas
            </p>
            <p className="text-[15px] font-bold text-gray-900 uppercase leading-none mt-1">
              Valid
            </p>
          </div>
        </Card>
      </div>

      {/* PDF VIEWER SECTION */}
      <Card className="border-gray-200 shadow-sm bg-gray-50 overflow-hidden rounded-xl">
        {/* Fake Window Toolbar macOS Style */}
        <div className="bg-gray-100/80 px-4 py-3 flex items-center border-b border-gray-200">
          <div className="flex gap-1.5 w-16">
            <div className="h-3 w-3 rounded-full bg-red-400 border border-red-500/20" />
            <div className="h-3 w-3 rounded-full bg-yellow-400 border border-yellow-500/20" />
            <div className="h-3 w-3 rounded-full bg-green-400 border border-green-500/20" />
          </div>
          <span className="flex-1 text-center text-xs font-semibold text-gray-500">
            Pratinjau Dokumen
          </span>
          <div className="w-16" /> {/* Spacer untuk menyeimbangkan layout */}
        </div>

        {/* Responsive Container for PDF Viewer */}
        <div className="w-full bg-[#525659] flex justify-center p-0 md:p-6 overflow-hidden">
          <div className="w-full max-w-4xl shadow-2xl overflow-hidden bg-white">
            {/* 💡 Note: PDFViewer terkadang tidak muncul di beberapa mobile browser, 
                tapi tetap aman karena ada tombol 'Cetak Notulensi' di atas */}
            <PDFViewer className="w-full h-[80vh] min-h-150 border-none">
              <NotulensiPDF
                meetingData={meetingData}
                attendees={attendees}
                photos={photos}
              />
            </PDFViewer>
          </div>
        </div>

        <div className="bg-white p-3 text-center border-t border-gray-100">
          <p className="text-[11px] text-gray-400 font-medium">
            Dokumen ini dihasilkan secara otomatis oleh Sistem E-NOTULEN Bapenda
            Prov. Sultra
          </p>
        </div>
      </Card>
    </div>
  );
}
