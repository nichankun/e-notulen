"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Printer, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { type Meeting, type Attendee } from "@/db/database/schema";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResultPage({ params }: PageProps) {
  const { id } = use(params);
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  // --- STATE UNTUK FOTO ---
  const [photos, setPhotos] = useState<string[]>([]);
  // -----------------------

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMeeting = await fetch(`/api/meetings/${id}`);
        const jsonMeeting = await resMeeting.json();
        const resAttendees = await fetch(`/api/meetings/${id}/attendees`);
        const jsonAttendees = await resAttendees.json();

        if (jsonMeeting.success) {
          setMeetingData(jsonMeeting.data);

          // --- PARSING FOTO DARI DATABASE ---
          if (jsonMeeting.data.photos) {
            try {
              const parsed = JSON.parse(jsonMeeting.data.photos);
              if (Array.isArray(parsed)) setPhotos(parsed);
            } catch (e) {
              console.error("Gagal parse foto:", e);
            }
          }
          // ----------------------------------

          setAttendees(jsonAttendees.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Memuat laporan...</div>;
  if (!meetingData) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-0">
      {/* Tombol Kontrol (Hilang saat Print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard/archive">
          <Button variant="ghost" className="text-slate-500">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </Link>
        <Button
          onClick={() => window.print()}
          className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg"
        >
          <Printer className="mr-2 h-4 w-4" /> Cetak ke PDF
        </Button>
      </div>

      <Card className="p-8 md:p-12 border-slate-200 shadow-sm bg-white print:shadow-none print:border-none print:p-0">
        {/* 1. KOP SURAT */}
        <div className="flex flex-col items-center text-center mb-6 border-b-4 border-double border-black pb-4">
          <h1 className="text-lg font-bold uppercase">
            Pemerintah Provinsi Sulawesi Tenggara
          </h1>
          <h2 className="text-xl font-extrabold uppercase leading-tight">
            Badan Pendapatan Daerah
          </h2>
          <p className="text-[10px] italic">
            Kompleks Bumi Praja Anduonohu, Kendari. Telp: (0401) 312xxxx, Email:
            bapenda@sultraprov.go.id
          </p>
        </div>

        {/* 2. JUDUL & INFORMASI RAPAT */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold underline uppercase">
            NOTULENSI KEGIATAN
          </h3>
        </div>

        <div className="space-y-6 text-sm">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="w-32 py-1 font-bold">Kegiatan</td>
                <td className="w-4 py-1 text-center">:</td>
                <td className="py-1">{meetingData.title}</td>
              </tr>
              <tr>
                <td className="py-1 font-bold">Hari / Tanggal</td>
                <td className="py-1 text-center">:</td>
                <td className="py-1">
                  {new Date(meetingData.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-bold">Tempat</td>
                <td className="py-1 text-center">:</td>
                <td className="py-1">{meetingData.location || "-"}</td>
              </tr>
              <tr>
                <td className="py-1 font-bold">Pimpinan</td>
                <td className="py-1 text-center">:</td>
                <td className="py-1">{meetingData.leader || "-"}</td>
              </tr>
            </tbody>
          </table>

          <hr className="border-black" />

          {/* 3. ISI NOTULEN */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm uppercase flex items-center gap-2">
              I. RISALAH PEMBAHASAN
            </h4>
            <div
              className="prose max-w-none text-black font-serif leading-relaxed text-justify px-2 text-sm"
              dangerouslySetInnerHTML={{
                __html: meetingData.content || "Tidak ada catatan pembahasan.",
              }}
            />
          </div>

          {/* 4. TABEL DAFTAR HADIR */}
          <div className="space-y-2 pt-4 break-inside-avoid">
            <h4 className="font-bold text-sm uppercase flex items-center gap-2">
              II. DAFTAR HADIR PESERTA
            </h4>
            <table className="w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-slate-100 print:bg-slate-200">
                  <th className="border border-black px-2 py-2 text-center w-8">
                    No
                  </th>
                  <th className="border border-black px-3 py-2 text-left">
                    Nama / NIP
                  </th>
                  <th className="border border-black px-3 py-2 text-left w-32">
                    Instansi / Bidang
                  </th>
                  <th className="border border-black px-3 py-2 text-center w-20">
                    Waktu
                  </th>
                  <th className="border border-black px-3 py-2 text-center w-24">
                    Tanda Tangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {attendees.length > 0 ? (
                  attendees.map((person, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 print:hover:bg-transparent"
                    >
                      <td className="border border-black px-2 py-1.5 text-center align-middle">
                        {idx + 1}
                      </td>
                      <td className="border border-black px-3 py-1.5 align-middle">
                        <div className="font-bold uppercase">{person.name}</div>
                        <div className="font-mono text-[10px] text-slate-600 print:text-black">
                          {person.nip || "-"}
                        </div>
                      </td>
                      <td className="border border-black px-3 py-1.5 align-middle uppercase text-[10px]">
                        {person.department || "-"}
                      </td>
                      <td className="border border-black px-3 py-1.5 text-center align-middle">
                        {new Date(person.scannedAt!).toLocaleTimeString(
                          "id-ID",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </td>
                      <td className="border border-black px-2 py-1 text-center align-middle h-12">
                        {person.signature ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={person.signature}
                            alt="ttd"
                            className="h-10 mx-auto mix-blend-multiply"
                          />
                        ) : (
                          <span className="text-[8px] italic text-slate-400">
                            Manual
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="border border-black px-4 py-4 text-center italic"
                    >
                      Belum ada data absensi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <p className="text-[10px] text-slate-500 italic mt-1">
              *Tanda tangan digital terekam otomatis saat pengisian daftar
              hadir.
            </p>
          </div>

          {/* 5. FOTO KEGIATAN (DIPERBARUI) */}
          <div className="space-y-4 pt-4 break-inside-avoid">
            <h4 className="font-bold text-sm uppercase flex items-center gap-2">
              III. DOKUMENTASI FOTO
            </h4>

            {photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {photos.map((src, idx) => (
                  <div
                    key={idx}
                    className="break-inside-avoid flex justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Dokumentasi ${idx + 1}`}
                      className="rounded-lg border border-slate-300 shadow-sm max-h-75 object-contain w-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-32 border-2 border-dashed border-black rounded-lg flex flex-col items-center justify-center bg-slate-50">
                <ImageIcon className="h-8 w-8 text-slate-300 mb-2 print:hidden" />
                <p className="text-slate-400 font-bold print:text-black text-xs">
                  TIDAK ADA DOKUMENTASI
                </p>
              </div>
            )}
          </div>

          {/* 6. TANDA TANGAN */}
          <div className="mt-12 grid grid-cols-2 gap-20 text-center break-inside-avoid">
            <div className="space-y-16">
              <p className="text-sm font-bold">Pimpinan Rapat,</p>
              <div>
                <p className="font-bold underline uppercase">
                  {meetingData.leader}
                </p>
                <p className="text-xs">NIP. ...........................</p>
              </div>
            </div>
            <div className="space-y-16">
              <p className="text-sm font-bold">Notulis,</p>
              <div>
                <p className="font-bold underline uppercase">Admin Notulis</p>
                <p className="text-xs">NIP. ...........................</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            background: white !important;
            font-size: 11pt;
          }
          nav,
          aside,
          button,
          .print:hidden,
          footer {
            display: none !important;
          }
          .print\:shadow-none {
            border: none !important;
            box-shadow: none !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th,
          td {
            border: 1px solid black !important;
          }
          hr {
            border-top: 2px solid black !important;
          }
          img {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
