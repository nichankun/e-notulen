"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";
import { type Meeting, type Attendee } from "@/db/database/schema";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PdfImage,
  PDFDownloadLink,
  PDFViewer, // PERUBAHAN: Tambahkan import PDFViewer
} from "@react-pdf/renderer";

interface PageProps {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// 1. STYLING UNTUK REACT-PDF
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10 },
  header: {
    textAlign: "center",
    borderBottomWidth: 3,
    borderBottomStyle: "solid",
    borderBottomColor: "#000",
    paddingBottom: 10,
    marginBottom: 20,
  },
  kop1: { fontSize: 12, fontWeight: "bold", textTransform: "uppercase" },
  kop2: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 4,
  },
  kop3: { fontSize: 8, fontStyle: "italic", marginTop: 4 },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textDecoration: "underline",
    textAlign: "center",
    marginBottom: 15,
  },
  row: { flexDirection: "row", marginBottom: 6 },
  colLabel: { width: 90, fontWeight: "bold" },
  colColon: { width: 10, textAlign: "center" },
  colValue: { flex: 1 },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
  },
  content: { textAlign: "justify", lineHeight: 1.5, fontSize: 10 },

  // Tabel
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  tableRow: { flexDirection: "row" },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    backgroundColor: "#f1f5f9",
    padding: 5,
    justifyContent: "center",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    padding: 5,
    justifyContent: "center",
  },
  tableCellHeader: { fontSize: 9, fontWeight: "bold", textAlign: "center" },
  tableCell: { fontSize: 9 },

  // Foto
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 5 },
  photoWrapper: { width: "48%", marginBottom: 10 },
  photo: {
    width: "100%",
    height: 150,
    objectFit: "contain",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ccc",
  },
  noPhoto: {
    textAlign: "center",
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 10,
  },
});

// ---------------------------------------------------------------------------
// PARSER KHUSUS UNTUK TIPTAP HTML KE REACT-PDF
// ---------------------------------------------------------------------------
const parseHtmlContent = (html: string) => {
  if (!html) return "Tidak ada catatan pembahasan.";

  let text = html;

  // 1. Tangani List item (Hapus <p> di dalam <li> agar rapi, tidak dobel enter)
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (match, content) => {
    return `<li>${content.replace(/<\/?p[^>]*>/gi, "")}</li>`;
  });

  // 2. Ordered List (<ol>) -> Menjadi penomoran otomatis
  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, inner) => {
    let i = 1;
    return inner.replace(
      /<li>([\s\S]*?)<\/li>/gi,
      (m: string, content: string) => `\n${i++}. ${content}`,
    );
  });

  // 3. Unordered List (<ul>) -> Menjadi Bullet
  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, inner) => {
    return inner.replace(
      /<li>([\s\S]*?)<\/li>/gi,
      (m: string, content: string) => `\n• ${content}`,
    );
  });

  // 4. Paragraf & line-break -> Spasi Enter
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // 5. Bersihkan SEMUA tag HTML KECUALI tag gaya teks (strong, b, i, em, u)
  text = text.replace(/<(\/?)([a-z0-9]+)[^>]*>/gi, (match, slash, tagName) => {
    const tag = tagName.toLowerCase();
    if (["strong", "b", "i", "em", "u"].includes(tag)) {
      return match;
    }
    return "";
  });

  // 6. Decode HTML entities dasar
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // 7. Rapikan spasi berlebih
  text = text.replace(/\n\s*\n/g, "\n\n").trim();

  // 8. Tokenisasi
  const tokens = text.split(/(<\/?(?:strong|b|i|em|u)[^>]*>)/gi);

  let isBold = false;
  let isItalic = false;
  let isUnderline = false;
  const result: React.ReactNode[] = [];

  tokens.forEach((token, index) => {
    if (!token) return;

    if (/^<[^>]+>$/.test(token)) {
      const lower = token.toLowerCase();
      if (/^<(strong|b)\b[^>]*>$/.test(lower)) isBold = true;
      else if (/^<\/(strong|b)[^>]*>$/.test(lower)) isBold = false;
      else if (/^<(i|em)\b[^>]*>$/.test(lower)) isItalic = true;
      else if (/^<\/(i|em)[^>]*>$/.test(lower)) isItalic = false;
      else if (/^<u\b[^>]*>$/.test(lower)) isUnderline = true;
      else if (/^<\/u[^>]*>$/.test(lower)) isUnderline = false;
    } else {
      let fontFamily = "Helvetica";
      if (isBold && isItalic) fontFamily = "Helvetica-BoldOblique";
      else if (isBold) fontFamily = "Helvetica-Bold";
      else if (isItalic) fontFamily = "Helvetica-Oblique";

      result.push(
        <Text
          key={index}
          style={{
            fontFamily,
            textDecoration: isUnderline ? "underline" : "none",
          }}
        >
          {token}
        </Text>,
      );
    }
  });

  return result;
};

// ---------------------------------------------------------------------------
// 2. KOMPONEN DOKUMEN REACT-PDF
// ---------------------------------------------------------------------------
const NotulensiPDF = ({
  meetingData,
  attendees,
  photos,
}: {
  meetingData: Meeting;
  attendees: Attendee[];
  photos: string[];
}) => (
  <Document>
    <Page size="LEGAL" style={styles.page}>
      {/* 1. KOP SURAT */}
      <View style={styles.header}>
        <Text style={styles.kop1}>Pemerintah Provinsi Sulawesi Tenggara</Text>
        <Text style={styles.kop2}>Badan Pendapatan Daerah</Text>
        <Text style={styles.kop3}>
          Kompleks Bumi Praja Anduonohu, Kendari. Telp: (0401) 312xxxx, Email:
          bapenda@sultraprov.go.id
        </Text>
      </View>

      {/* 2. JUDUL */}
      <Text style={styles.title}>NOTULENSI KEGIATAN</Text>

      {/* INFO KEGIATAN */}
      <View style={styles.row}>
        <Text style={styles.colLabel}>Kegiatan</Text>
        <Text style={styles.colColon}>:</Text>
        <Text style={styles.colValue}>{meetingData.title}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.colLabel}>Hari / Tanggal</Text>
        <Text style={styles.colColon}>:</Text>
        <Text style={styles.colValue}>
          {new Date(meetingData.date).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.colLabel}>Tempat</Text>
        <Text style={styles.colColon}>:</Text>
        <Text style={styles.colValue}>{meetingData.location || "-"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.colLabel}>Pimpinan</Text>
        <Text style={styles.colColon}>:</Text>
        <Text style={styles.colValue}>{meetingData.leader || "-"}</Text>
      </View>

      <View style={styles.divider} />

      {/* 3. ISI NOTULEN */}
      <Text style={styles.sectionTitle}>I. RISALAH PEMBAHASAN</Text>
      <Text style={styles.content}>
        {parseHtmlContent(meetingData.content || "")}
      </Text>

      {/* 4. DAFTAR HADIR */}
      <Text style={styles.sectionTitle}>II. DAFTAR HADIR PESERTA</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={[styles.tableColHeader, { width: "8%" }]}>
            <Text style={styles.tableCellHeader}>No</Text>
          </View>
          <View style={[styles.tableColHeader, { width: "32%" }]}>
            <Text style={styles.tableCellHeader}>Nama / NIP</Text>
          </View>
          <View style={[styles.tableColHeader, { width: "25%" }]}>
            <Text style={styles.tableCellHeader}>Instansi / Bidang</Text>
          </View>
          <View style={[styles.tableColHeader, { width: "15%" }]}>
            <Text style={styles.tableCellHeader}>Waktu</Text>
          </View>
          <View style={[styles.tableColHeader, { width: "20%" }]}>
            <Text style={styles.tableCellHeader}>Tanda Tangan</Text>
          </View>
        </View>
        {attendees.length > 0 ? (
          attendees.map((person, idx) => (
            <View style={styles.tableRow} key={idx} wrap={false}>
              <View
                style={[styles.tableCol, { width: "8%", alignItems: "center" }]}
              >
                <Text style={styles.tableCell}>{idx + 1}</Text>
              </View>
              <View style={[styles.tableCol, { width: "32%" }]}>
                <Text
                  style={[
                    styles.tableCell,
                    { fontWeight: "bold", textTransform: "uppercase" },
                  ]}
                >
                  {person.name}
                </Text>
                <Text style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>
                  {person.nip || "-"}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text
                  style={[
                    styles.tableCell,
                    { textTransform: "uppercase", fontSize: 8 },
                  ]}
                >
                  {person.department || "-"}
                </Text>
              </View>
              <View
                style={[
                  styles.tableCol,
                  { width: "15%", alignItems: "center" },
                ]}
              >
                <Text style={styles.tableCell}>
                  {person.scannedAt
                    ? new Date(person.scannedAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </Text>
              </View>
              <View
                style={[
                  styles.tableCol,
                  { width: "20%", alignItems: "center", padding: 2 },
                ]}
              >
                {person.signature ? (
                  <PdfImage
                    src={person.signature}
                    style={{ width: 40, height: 20, objectFit: "contain" }}
                  />
                ) : (
                  <Text style={styles.tableCell}>-</Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.tableRow}>
            <View
              style={[
                styles.tableCol,
                { width: "100%", alignItems: "center", padding: 10 },
              ]}
            >
              <Text style={[styles.tableCell, { fontStyle: "italic" }]}>
                Belum ada data absensi
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 5. FOTO KEGIATAN */}
      <Text style={styles.sectionTitle}>III. DOKUMENTASI FOTO</Text>
      {photos.length > 0 ? (
        <View style={styles.photoGrid}>
          {photos.map((src, idx) => (
            <View key={idx} style={styles.photoWrapper} wrap={false}>
              <PdfImage src={src} style={styles.photo} />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noPhoto}>TIDAK ADA DOKUMENTASI</Text>
      )}
    </Page>
  </Document>
);

// ---------------------------------------------------------------------------
// 3. KOMPONEN UTAMA
// ---------------------------------------------------------------------------
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
              <Printer className="mr-2 h-4 w-4" />
              {pdfLoading ? "Menyiapkan Dokumen..." : "Unduh PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* PERUBAHAN: HTML Tampilan Web Diganti Penuh dengan PDFViewer */}
      <Card className="border-slate-200 shadow-sm bg-slate-50 overflow-hidden">
        <PDFViewer className="w-full h-200 border-none rounded-xl">
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
