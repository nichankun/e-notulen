"use client";

import { Document, Page } from "@react-pdf/renderer";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { styles } from "./pdf-styles";
import {
  PdfHeader,
  PdfMeetingInfo,
  PdfRisalah,
  PdfAttendanceTable,
  PdfPhotos,
} from "./pdf-sections";

export default function NotulensiPDF({
  meetingData,
  attendees = [],
  photos = [], // Mengantisipasi jika nanti ada fitur foto
}: {
  meetingData: Meeting;
  attendees?: Attendee[];
  photos?: string[];
  status?: "draft" | "final";
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Tampilkan Watermark jika masih Draft */}

        {/* 1. Kop Surat Bapenda Sultra */}
        <PdfHeader />

        {/* 2. Informasi Rapat (Format NOTULA Resmi) */}
        <PdfMeetingInfo meetingData={meetingData} />

        {/* 3. Isi Notulen & Tanda Tangan Pimpinan */}
        <PdfRisalah content={meetingData.content || ""} />

        {/* 4. Tabel Daftar Hadir Peserta */}
        <PdfAttendanceTable attendees={attendees} />

        {/* 5. Lampiran Dokumentasi (Jika Ada) */}
        <PdfPhotos photos={photos} />
      </Page>
    </Document>
  );
}
