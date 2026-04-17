"use client";

import { Document, Page, Text } from "@react-pdf/renderer";
import { type Meeting, type Attendee } from "@/db/database/schema";

// Import file-file pendukung
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
  attendees,
  photos,
}: {
  meetingData: Meeting;
  attendees: Attendee[];
  photos: string[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Potongan Komponen PDF */}
        <PdfHeader />
        <PdfMeetingInfo meetingData={meetingData} />
        <PdfRisalah content={meetingData.content || ""} />
        <PdfAttendanceTable attendees={attendees} />
        <PdfPhotos photos={photos} />

        {/* NOMOR HALAMAN OTOMATIS */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Halaman ${pageNumber} dari ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
