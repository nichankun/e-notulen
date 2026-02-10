"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { type Meeting, type Attendee } from "@/db/database/schema";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ResultPage({ params }: PageProps) {
  const { id } = use(params);
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
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
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Memuat laporan...</div>;
  if (!meetingData) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-0 print:p-0 print:max-w-none">
      {/* TOMBOL KONTROL */}
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-3 print:hidden">
        <Link href="/dashboard/archive" className="w-full md:w-auto">
          <Button variant="ghost" className="text-slate-500 w-full md:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </Link>
        <Button
          onClick={() => window.print()}
          className="bg-blue-700 hover:bg-blue-800 text-white shadow-lg w-full md:w-auto"
        >
          <Printer className="mr-2 h-4 w-4" /> Cetak ke PDF
        </Button>
      </div>

      {/* KARTU LAPORAN */}
      <Card className="p-6 md:p-12 border-slate-200 shadow-sm bg-white print:shadow-none print:border-none print:p-50 print:m-0 print:w-full">
        {/* 1. KOP SURAT */}
        {/* Tambahkan padding-top manual disini khusus print halaman 1 karena margin @page dinolkan */}
        <div className="flex flex-col items-center text-center mb-6 border-b-4 border-double border-black pb-4 print:pt-24">
          <h1 className="text-base md:text-lg font-bold uppercase">
            Pemerintah Provinsi Sulawesi Tenggara
          </h1>
          <h2 className="text-lg md:text-xl font-extrabold uppercase leading-tight">
            Badan Pendapatan Daerah
          </h2>
          <p className="text-[9px] md:text-[10px] italic px-4 md:px-0">
            Kompleks Bumi Praja Anduonohu, Kendari. Telp: (0401) 312xxxx, Email:
            bapenda@sultraprov.go.id
          </p>
        </div>

        {/* 2. JUDUL */}
        <div className="text-center mb-6 md:mb-8">
          <h3 className="text-lg font-bold underline uppercase">
            NOTULENSI KEGIATAN
          </h3>
        </div>

        {/* KONTEN UTAMA */}
        <div className="space-y-6 text-sm print:text-sm print:leading-normal">
          {/* Tabel Info */}
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full border-collapse min-w-75">
              <tbody>
                <tr>
                  <td className="w-24 md:w-32 py-1 font-bold whitespace-nowrap align-top">
                    Kegiatan
                  </td>
                  <td className="w-4 py-1 text-center align-top">:</td>
                  <td className="py-1">{meetingData.title}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold whitespace-nowrap align-top">
                    Hari / Tanggal
                  </td>
                  <td className="py-1 text-center align-top">:</td>
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
                  <td className="py-1 font-bold whitespace-nowrap align-top">
                    Tempat
                  </td>
                  <td className="py-1 text-center align-top">:</td>
                  <td className="py-1">{meetingData.location || "-"}</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold whitespace-nowrap align-top">
                    Pimpinan
                  </td>
                  <td className="py-1 text-center align-top">:</td>
                  <td className="py-1">{meetingData.leader || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr className="border-black" />

          {/* 3. ISI NOTULEN */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm uppercase flex items-center gap-2">
              I. RISALAH PEMBAHASAN
            </h4>
            <div
              className="prose max-w-none text-black font-serif text-justify px-2 text-sm print:leading-normal"
              dangerouslySetInnerHTML={{
                __html: meetingData.content || "Tidak ada catatan pembahasan.",
              }}
            />
          </div>

          {/* 4. DAFTAR HADIR */}
          <div className="space-y-2 pt-4">
            <h4 className="font-bold text-sm uppercase flex items-center gap-2">
              II. DAFTAR HADIR PESERTA
            </h4>

            <div className="overflow-x-auto border border-black rounded-sm md:border-0 md:rounded-none print:border-0">
              <table className="w-full border-collapse border-0 md:border border-black text-xs min-w-125">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200">
                    <th className="border border-black px-2 py-2 text-center w-8">
                      No
                    </th>
                    <th className="border border-black px-3 py-2 text-left">
                      Nama / NIP
                    </th>
                    <th className="border border-black px-3 py-2 text-left">
                      Instansi / Bidang
                    </th>
                    <th className="border border-black px-3 py-2 text-center w-24">
                      Waktu
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
                          <div className="font-bold uppercase">
                            {person.name}
                          </div>
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="border border-black px-4 py-4 text-center italic"
                      >
                        Belum ada data absensi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. FOTO KEGIATAN */}
          <div className="space-y-4 pt-4">
            <h4 className="font-bold text-sm uppercase flex items-center gap-2">
              III. DOKUMENTASI FOTO
            </h4>

            {photos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {photos.map((src, idx) => (
                  <div
                    key={idx}
                    className="break-inside-avoid flex justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Dokumentasi ${idx + 1}`}
                      className="rounded-lg border border-slate-300 shadow-sm max-h-75 object-contain w-full bg-slate-50 print:border-slate-800"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-24 border-2 border-dashed border-black rounded-lg flex flex-col items-center justify-center bg-slate-50">
                <p className="text-slate-400 font-bold print:text-black text-xs">
                  TIDAK ADA DOKUMENTASI
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <style jsx global>{`
        @media print {
          @page {
            /* HALAMAN UMUM (Page 2, 3, dst): Margin Normal */
            size: 210mm 330mm;
            margin: 2.54cm;
          }

          /* HALAMAN PERTAMA: Margin Atas 0 untuk hilangkan Header Browser */
          @page :first {
            margin-top: 0mm !important;
            /* Margin lainnya tetap */
            margin-right: 2.54cm;
            margin-bottom: 2.54cm;
            margin-left: 2.54cm;
          }

          body {
            background: white !important;
            font-size: 11pt;
            visibility: hidden;
            padding: 0 !important;
            line-height: 1.5 !important;
          }

          .print\:shadow-none {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            /* Margin container di-0-kan karena sudah diatur @page */
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
          }

          .print\:shadow-none * {
            visibility: visible;
          }

          nav,
          aside,
          button,
          .print\:hidden,
          footer,
          header {
            display: none !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          tr {
            break-inside: auto;
          }

          th,
          td {
            border: 1px solid black !important;
            padding: 4px 8px !important;
          }

          hr {
            border-top: 2px solid black !important;
            margin-top: 1rem !important;
            margin-bottom: 1rem !important;
          }

          img {
            max-width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
