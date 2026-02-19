"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import Link from "next/link";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { Progress } from "@/components/ui/progress"; // PERUBAHAN: Import komponen Progress shadcn

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
  const [progress, setProgress] = useState(13); // PERUBAHAN: State untuk nilai loading bar

  // PERUBAHAN: Efek animasi untuk progress bar saat loading
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
            } catch (e) {
              console.error("Gagal parse foto:", e);
            }
          }
          setAttendees(jsonAttendees.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setProgress(100); // PERUBAHAN: Set progress penuh sebelum loading selesai
        setTimeout(() => setLoading(false), 300); // Jeda sedikit agar user melihat bar penuh 100%
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    // PERUBAHAN: Mengganti UI Loading standar dengan Shadcn Progress Card
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
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-0">
      {/* TOMBOL KONTROL */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-3">
        <Link href="/dashboard/archive" className="w-full md:w-auto">
          <Button variant="ghost" className="text-slate-500 w-full md:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </Link>

        {/* PDF Download dari @react-pdf/renderer */}
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
              className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg w-full md:w-auto"
            >
              {pdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              {pdfLoading ? "Menyiapkan Dokumen..." : "Unduh PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* KARTU LAPORAN (PDF Viewer) */}
      <Card className="border-slate-200 shadow-sm bg-slate-50 overflow-hidden">
        <PDFViewer className="w-full h-screen min-h-200 border-none rounded-xl">
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
