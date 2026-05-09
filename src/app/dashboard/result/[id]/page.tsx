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
    if (loading) timer = setTimeout(() => setProgress(66), 500);
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
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-3 max-w-xs mx-auto p-4 text-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground">Memuat arsip...</p>
        <Progress value={progress} className="w-full h-1" />
      </div>
    );
  }

  if (!meetingData) return null;

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-full h-8 w-8 shrink-0"
          >
            <Link href="/dashboard/archive">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-lg text-foreground truncate">
              {meetingData.title}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-medium px-2 py-0"
              >
                Selesai
              </Badge>
              <span className="text-xs text-muted-foreground hidden md:block truncate">
                ID: {id}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full md:w-auto shrink-0">
          <PDFDownloadLink
            document={
              <NotulensiPDF
                meetingData={meetingData}
                attendees={attendees}
                photos={photos}
              />
            }
            fileName={`Notulensi_${meetingData.title.replace(/\s+/g, "_")}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <Button
                disabled={pdfLoading}
                size="sm"
                className="w-full md:w-auto gap-2"
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Menyiapkan...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4" /> Cetak PDF
                  </>
                )}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          {
            icon: <Users className="h-4 w-4" />,
            color: "text-primary bg-primary/10",
            label: "Hadir",
            value: `${attendees.length} Orang`,
          },
          {
            icon: <Camera className="h-4 w-4" />,
            color: "text-indigo-500 bg-indigo-500/10",
            label: "Dokumentasi",
            value: `${photos.length} Foto`,
          },
          {
            icon: <Calendar className="h-4 w-4" />,
            color: "text-orange-500 bg-orange-500/10",
            label: "Tanggal",
            value: new Date(meetingData.date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            }),
          },
          {
            icon: <FileCheck className="h-4 w-4" />,
            color: "text-emerald-500 bg-emerald-500/10",
            label: "Integritas",
            value: "Valid",
          },
        ].map((item) => (
          <Card
            key={item.label}
            className="p-3 flex items-center gap-3 rounded-lg border shadow-none"
          >
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}
            >
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {item.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* PDF VIEWER */}
      <Card className="overflow-hidden rounded-lg border shadow-none">
        <div className="bg-muted/50 px-4 py-2 flex items-center border-b">
          <div className="flex gap-1.5 w-12">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="flex-1 text-center text-xs text-muted-foreground font-medium">
            Pratinjau Dokumen
          </span>
          <div className="w-12" />
        </div>

        <div className="w-full bg-muted/30 flex justify-center p-0 md:p-4">
          <div className="w-full max-w-4xl bg-background">
            <PDFViewer className="w-full h-[80vh] border-none">
              <NotulensiPDF
                meetingData={meetingData}
                attendees={attendees}
                photos={photos}
              />
            </PDFViewer>
          </div>
        </div>

        <div className="px-4 py-2 border-t">
          <p className="text-[10px] text-muted-foreground text-center">
            Dokumen dihasilkan otomatis oleh Sistem E-NOTULEN Bapenda Prov.
            Sultra
          </p>
        </div>
      </Card>
    </div>
  );
}
