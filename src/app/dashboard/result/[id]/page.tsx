"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Printer,
  Calendar,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { type Meeting, type Attendee } from "@/db/database/schema";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResultPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data (Sama seperti Live Page, tapi hanya sekali run)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil Detail Rapat
        const resMeeting = await fetch(`/api/meetings/${id}`);
        const jsonMeeting = await resMeeting.json();

        // Ambil Peserta
        const resAttendees = await fetch(`/api/meetings/${id}/attendees`);
        const jsonAttendees = await resAttendees.json();

        if (jsonMeeting.success) {
          setMeetingData(jsonMeeting.data);
          setAttendees(jsonAttendees.data || []);
        } else {
          alert("Data tidak ditemukan");
          router.push("/dashboard/archive");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  if (loading) return <div className="p-10 text-center">Memuat data...</div>;
  if (!meetingData) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Navigasi */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/archive">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Arsip
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* KOLOM KIRI: Informasi Rapat & Absensi */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 border-slate-200 shadow-sm bg-white">
            <h2 className="font-bold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-2">
              Detail Kegiatan
            </h2>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Judul Rapat
                </span>
                <p className="font-bold text-slate-700">{meetingData.title}</p>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <span className="text-xs text-slate-400 block">Tanggal</span>
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(meetingData.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-red-500" />
                <div>
                  <span className="text-xs text-slate-400 block">Lokasi</span>
                  <p className="text-sm font-medium text-slate-700">
                    {meetingData.location || "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-purple-500" />
                <div>
                  <span className="text-xs text-slate-400 block">
                    Pimpinan Rapat
                  </span>
                  <p className="text-sm font-medium text-slate-700">
                    {meetingData.leader || "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm text-slate-800">
                  Daftar Hadir
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  {attendees.length} Orang
                </Badge>
              </div>

              <div className="max-h-75 overflow-y-auto space-y-2 pr-2">
                {attendees.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    Tidak ada data absensi.
                  </p>
                ) : (
                  attendees.map((person, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-md"
                    >
                      <span className="font-medium text-slate-700">
                        {person.name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(person.scannedAt!).toLocaleTimeString(
                          "id-ID",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* KOLOM KANAN: Hasil Notulen */}
        <div className="md:col-span-2">
          <Card className="min-h-125 p-8 border-slate-200 shadow-sm bg-white relative">
            <div className="absolute top-0 right-0 p-4">
              <FileText className="h-24 w-24 text-slate-100 -rotate-12" />
            </div>

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Notulensi Rapat
              </h2>
              <p className="text-slate-500 text-sm mb-8">
                Hasil catatan keputusan dan pembahasan rapat.
              </p>

              <div className="prose max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-serif bg-slate-50 p-6 rounded-xl border border-slate-100">
                {meetingData.content || (
                  <span className="text-slate-400 italic">
                    Belum ada notulen yang dicatat.
                  </span>
                )}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end gap-12 text-center">
              <div>
                <p className="text-xs text-slate-400 mb-16">Mengetahui,</p>
                <p className="font-bold text-slate-800 border-b border-slate-300 pb-1 min-w-37.5">
                  {meetingData.leader}
                </p>
                <p className="text-xs text-slate-500 mt-1">Pimpinan Rapat</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-16">Notulis,</p>
                <p className="font-bold text-slate-800 border-b border-slate-300 pb-1 min-w-37.5">
                  Admin Notulen
                </p>
                <p className="text-xs text-slate-500 mt-1">Staf Bapenda</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
