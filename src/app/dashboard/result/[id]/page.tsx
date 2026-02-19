"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import Link from "next/link";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Progress } from "@/components/ui/progress";

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
        const resMeeting = await fetch(`/api/meetings/${id}`);
        const jsonMeeting = await resMeeting.json();
        const resAttendees = await fetch(`/api/meetings/${id}/attendees`);
        const jsonAttendees = await resAttendees.json();

        if (jsonMeeting.success) {
          setMeetingData(jsonMeeting.data);

          if (jsonMeeting.data.photos) {
            try {
              const parsed = JSON.parse(jsonMeeting.data.photos);
              if (Array.isArray(parsed)) setPhotos(parsed);
            } catch (e: unknown) {
              console.error("Gagal parse foto:", e);
            }
          }
          setAttendees(jsonAttendees.data || []);
        }
      } catch (e: unknown) {
        console.error(e);
      } finally {
        setProgress(100);
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 max-w-sm mx-auto p-4">
        <div className="flex flex-col items-center text-slate-500 mb-4">
          <Loader2 className="animate-spin h-10 w-10 mb-4 text-blue-600" />
          <p className="font-semibold text-sm">Mempersiapkan Dokumen...</p>
          <p className="text-xs text-slate-400 mt-1">
            Mengambil risalah, data absensi, dan foto.
          </p>
        </div>
        <Progress value={progress} className="w-full h-2" />
      </div>
    );
  }

  if (!meetingData) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-0 selection:bg-blue-100">
      {/* TOMBOL KONTROL */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-3 animate-in fade-in duration-700">
        <Button
          variant="ghost"
          asChild
          className="text-slate-500 w-full md:w-auto"
        >
          <Link href="/dashboard/archive">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Arsip
          </Link>
        </Button>

        <PDFDownloadLink
          document={
            <NotulensiPDF
              meetingData={meetingData}
              attendees={attendees}
              photos={photos}
            />
          }
          fileName={`Notulensi_${meetingData.title.replace(/\s+/g, "_")}.pdf`}
          className="w-full md:w-auto flex"
        >
          {({ loading: pdfLoading }) => (
            <Button
              disabled={pdfLoading}
              className="bg-blue-700 hover:bg-blue-800 text-white shadow-xl shadow-blue-200/50 w-full md:w-auto font-bold rounded-xl h-11 transition-all active:scale-95"
            >
              {pdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              {pdfLoading ? "Menyiapkan Dokumen..." : "Unduh Laporan PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* KARTU LAPORAN (PDF Viewer) */}
      <Card className="border-slate-200 shadow-2xl shadow-slate-200/50 bg-slate-100 overflow-hidden rounded-2xl animate-in slide-in-from-bottom-4 duration-1000">
        <div className="bg-slate-800 p-2 flex items-center justify-center text-white/50 text-[10px] font-bold uppercase tracking-widest">
          Pratinjau Dokumen Legal
        </div>
        <PDFViewer className="w-full h-[80vh] min-h-125 border-none">
          <NotulensiPDF
            meetingData={meetingData}
            attendees={attendees}
            photos={photos}
          />
        </PDFViewer>
      </Card>
    </div>
  );
}
