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
  photos = [],
}: {
  meetingData: Meeting;
  attendees?: Attendee[];
  photos?: string[];
  status?: "draft" | "final";
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 1. Kop Surat */}
        <PdfHeader />

        {/* 2. Informasi Rapat */}
        <PdfMeetingInfo meetingData={meetingData} />

        {/* 3. Isi Notulen & Tanda Tangan — sekarang menerima meetingData */}
        <PdfRisalah
          content={meetingData.content || ""}
          meetingData={meetingData}
        />

        {/* 4. Daftar Hadir */}
        <PdfAttendanceTable attendees={attendees} />

        {/* 5. Dokumentasi */}
        <PdfPhotos photos={photos} />
      </Page>
    </Document>
  );
}
