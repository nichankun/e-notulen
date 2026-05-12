"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Loader2 } from "lucide-react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import NotulensiPDF from "@/components/dashboard/result/notulensipdf";
import { type Meeting, type Attendee } from "@/db/database/schema";

interface PdfSectionProps {
  meetingData: Meeting;
  attendees: Attendee[];
  photos: string[];
}

export function PdfSection({
  meetingData,
  attendees,
  photos,
}: PdfSectionProps) {
  const pdfDoc = (
    <NotulensiPDF
      meetingData={meetingData}
      attendees={attendees}
      photos={photos}
    />
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <PDFDownloadLink
          document={pdfDoc}
          fileName={`Notulensi_${meetingData.title.replace(/\s+/g, "_")}.pdf`}
        >
          {({ loading: pdfLoading }) => (
            <Button
              disabled={pdfLoading}
              size="sm"
              className="gap-2 font-semibold"
            >
              {pdfLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Menyiapkan PDF...
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

      <Card className="overflow-hidden rounded-xl border border-border bg-card flex flex-col">
        <div className="bg-muted/50 px-4 py-2 flex items-center border-b border-border">
          <div className="flex gap-1.5 w-12">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="flex-1 text-center text-xs text-muted-foreground font-bold tracking-wide">
            Pratinjau Dokumen
          </span>
          <div className="w-12" />
        </div>

        <div className="w-full bg-muted/20 flex justify-center p-0 md:p-4">
          <div className="w-full max-w-4xl bg-background rounded overflow-hidden">
            <PDFViewer className="w-full h-[80vh] border-none bg-background">
              {pdfDoc}
            </PDFViewer>
          </div>
        </div>

        <div className="px-4 py-2 border-t border-border bg-muted/10">
          <p className="text-[10px] font-medium text-muted-foreground text-center">
            Dokumen dihasilkan otomatis oleh Sistem E-NOTULEN Bapenda Prov.
            Sultra
          </p>
        </div>
      </Card>
    </div>
  );
}
