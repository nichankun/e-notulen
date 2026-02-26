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
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 max-w-sm mx-auto p-4 text-center">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-2" />
        <p className="font-bold text-slate-700 uppercase tracking-widest text-xs">
          Membangun Arsip Digital...
        </p>
        <Progress value={progress} className="w-full h-1.5" />
      </div>
    );
  }

  if (!meetingData) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="rounded-xl shrink-0"
          >
            <Link href="/dashboard/archive">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-black text-xl text-slate-900 truncate tracking-tight">
              {meetingData.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-[10px] font-bold uppercase tracking-tighter"
              >
                Selesai Diarsipkan
              </Badge>
              <span className="text-[10px] text-slate-400 font-medium">
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
              className="bg-slate-900 hover:bg-blue-700 text-white shadow-xl shadow-slate-200 w-full md:w-auto font-black uppercase tracking-widest h-12 rounded-2xl transition-all active:scale-95"
            >
              {pdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              {pdfLoading ? "Menyiapkan PDF..." : "Cetak Notulensi"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* EXECUTIVE SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-100 shadow-sm flex items-center gap-4 bg-white rounded-2xl">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Hadir
            </p>
            <p className="text-lg font-black text-slate-800">
              {attendees.length}{" "}
              <span className="text-xs font-medium text-slate-500">Orang</span>
            </p>
          </div>
        </Card>

        <Card className="p-4 border-slate-100 shadow-sm flex items-center gap-4 bg-white rounded-2xl">
          <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Dokumentasi
            </p>
            <p className="text-lg font-black text-slate-800">
              {photos.length}{" "}
              <span className="text-xs font-medium text-slate-500">Foto</span>
            </p>
          </div>
        </Card>

        <Card className="p-4 border-slate-100 shadow-sm flex items-center gap-4 bg-white rounded-2xl">
          <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Tanggal
            </p>
            <p className="text-sm font-black text-slate-800 truncate">
              {new Date(meetingData.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </Card>

        <Card className="p-4 border-slate-100 shadow-sm flex items-center gap-4 bg-white rounded-2xl">
          <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Integritas
            </p>
            <p className="text-sm font-black text-slate-800 italic uppercase">
              Valid
            </p>
          </div>
        </Card>
      </div>

      {/* PDF VIEWER SECTION */}
      <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 bg-slate-50 overflow-hidden rounded-3xl group">
        <div className="bg-slate-900 px-6 py-3 flex items-center justify-between text-white">
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Digital Document Preview
          </span>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </div>
        </div>

        {/* Responsive Container for PDF Viewer */}
        <div className="w-full bg-slate-200 flex justify-center p-0 md:p-8 overflow-hidden">
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

        <div className="bg-white p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Dokumen ini dihasilkan secara otomatis oleh Sistem E-NOTULEN Bapenda
            Prov. Sultra
          </p>
        </div>
      </Card>
    </div>
  );
}
