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
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfHeader />
        <PdfMeetingInfo meetingData={meetingData} />
        <PdfRisalah
          content={meetingData.content || ""}
          meetingData={meetingData}
        />
        <PdfAttendanceTable attendees={attendees} />
        <PdfPhotos photos={photos} />
      </Page>
    </Document>
  );
}
